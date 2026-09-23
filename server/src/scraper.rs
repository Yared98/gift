use crate::models::ScrapeResponse;
use scraper::{Html, Selector};
use std::time::Duration;

const SOCIAL_UA: &str = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const WHATSAPP_UA: &str = "WhatsApp/2.21.4.13 A";
const BROWSER_UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

fn is_challenge_page(html: &str) -> bool {
    html.is_empty()
        || html.contains("account-verification")
        || html.contains("cf-browser-verification")
        || html.contains("cf-challenge")
        || html.contains("Continuando para a loja")
        || html.contains("pow_nonce")
        || html.contains("solvePow")
}

pub async fn scrape_product_url(target_url: &str) -> Result<ScrapeResponse, String> {
    // 1. First attempt: Use WhatsApp crawler UA (bypasses CloudFront, wBuy, e-commerces)
    let mut html_content = fetch_html(target_url, WHATSAPP_UA).await.unwrap_or_default();

    // 2. If WhatsApp failed or got challenge, try Facebook externalhit (Mercado Livre, Amazon)
    if is_challenge_page(&html_content) {
        if let Ok(social_html) = fetch_html(target_url, SOCIAL_UA).await {
            if !is_challenge_page(&social_html) {
                html_content = social_html;
            }
        }
    }

    // 3. If still empty or challenged, fallback to full Desktop Chrome UA
    if is_challenge_page(&html_content) {
        if let Ok(browser_html) = fetch_html(target_url, BROWSER_UA).await {
            if !browser_html.is_empty() {
                html_content = browser_html;
            }
        }
    }

    if html_content.is_empty() {
        return Err("Não foi possível carregar o conteúdo da página do produto.".to_string());
    }

    let document = Html::parse_document(&html_content);

    let mut title = String::new();
    let mut image_url = String::new();
    let mut price: f64 = 0.0;
    let mut description = String::new();

    // Helper to query meta tag by property or name
    let get_meta = |doc: &Html, prop_attr: &str, prop_val: &str| -> Option<String> {
        let sel_str = format!("meta[{}='{}']", prop_attr, prop_val);
        if let Ok(sel) = Selector::parse(&sel_str) {
            for el in doc.select(&sel) {
                if let Some(content) = el.value().attr("content") {
                    let c = content.trim();
                    if !c.is_empty() {
                        return Some(c.to_string());
                    }
                }
            }
        }
        None
    };

    // Helper to query meta tag regardless of whether it uses 'property' or 'name'
    let get_meta_any = |doc: &Html, name_or_prop: &str| -> Option<String> {
        get_meta(doc, "property", name_or_prop)
            .or_else(|| get_meta(doc, "name", name_or_prop))
            .or_else(|| get_meta(doc, "itemprop", name_or_prop))
            .or_else(|| get_meta(doc, "itemProp", name_or_prop))
    };

    // --- 1. TITLE ---
    if let Some(t) = get_meta_any(&document, "og:title") {
        title = t;
    } else if let Some(t) = get_meta_any(&document, "twitter:title") {
        title = t;
    } else if let Some(t) = get_meta_any(&document, "title") {
        title = t;
    } else if let Ok(sel) = Selector::parse("title") {
        if let Some(el) = document.select(&sel).next() {
            title = el.text().collect::<Vec<_>>().join(" ").trim().to_string();
        }
    }

    // --- 2. IMAGE ---
    if let Some(img) = get_meta_any(&document, "og:image") {
        image_url = img;
    } else if let Some(img) = get_meta_any(&document, "og:image:secure_url") {
        image_url = img;
    } else if let Some(img) = get_meta_any(&document, "twitter:image") {
        image_url = img;
    } else if let Some(img) = get_meta_any(&document, "twitter:image:src") {
        image_url = img;
    } else if let Some(img) = get_meta_any(&document, "image") {
        image_url = img;
    } else if let Ok(sel) = Selector::parse("link[rel='image_src']") {
        if let Some(el) = document.select(&sel).next() {
            if let Some(href) = el.value().attr("href") {
                image_url = href.to_string();
            }
        }
    }

    // --- 3. DESCRIPTION ---
    if let Some(desc) = get_meta_any(&document, "og:description") {
        description = desc;
    } else if let Some(desc) = get_meta_any(&document, "twitter:description") {
        description = desc;
    } else if let Some(desc) = get_meta_any(&document, "description") {
        description = desc;
    }

    // --- 4. PRICE FROM META TAGS ---
    let raw_price = get_meta_any(&document, "product:price:amount")
        .or_else(|| get_meta_any(&document, "og:price:amount"))
        .or_else(|| get_meta_any(&document, "price"))
        .or_else(|| get_meta(&document, "itemprop", "price"))
        .or_else(|| get_meta(&document, "itemProp", "price"));

    if let Some(p_str) = raw_price {
        if let Some(val) = parse_price_str(&p_str) {
            price = val;
        }
    }

    // --- 5. JSON-LD FALLBACK (Schema.org) ---
    if image_url.is_empty() || price == 0.0 {
        if let Ok(ld_sel) = Selector::parse("script[type='application/ld+json']") {
            for script_el in document.select(&ld_sel) {
                let text = script_el.text().collect::<Vec<_>>().join("");
                if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(&text) {
                    // JSON-LD can be a single object or an array or @graph
                    extract_from_json_ld(&json_val, &mut image_url, &mut price);
                    if !image_url.is_empty() && price > 0.0 {
                        break;
                    }
                }
            }
        }
    }

    // --- 6. REGEX PRICE FALLBACK ---
    // Mercado Livre puts price at the end of og:title like "... - R$ 282"
    if price == 0.0 {
        if let Some(extracted_price) = extract_price_from_text(&title) {
            price = extracted_price;
        } else if let Some(extracted_price) = extract_price_from_text(&description) {
            price = extracted_price;
        }
    }

    // --- 7. CLEAN UP TITLE ---
    // If title has "- R$ 282" at the end, clean it up for a cleaner display
    if let Some(pos) = title.rfind(" - R$") {
        title = title[..pos].trim().to_string();
    } else if let Some(pos) = title.rfind(" | ") {
        // e.g. "Product Title | Mercado Livre"
        let candidate = title[..pos].trim();
        if !candidate.is_empty() {
            title = candidate.to_string();
        }
    }

    // --- 8. RESOLVE RELATIVE IMAGE URL ---
    if !image_url.is_empty() && image_url.starts_with('/') {
        if let Ok(base) = reqwest::Url::parse(target_url) {
            if let Ok(joined) = base.join(&image_url) {
                image_url = joined.to_string();
            }
        }
    }

    Ok(ScrapeResponse {
        title,
        image_url,
        price,
        description,
    })
}

async fn fetch_html(target_url: &str, user_agent: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(12))
        .user_agent(user_agent)
        .redirect(reqwest::redirect::Policy::limited(6))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(target_url)
        .header(
            "Accept",
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        )
        .header("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")
        .header("Cache-Control", "no-cache")
        .send()
        .await
        .map_err(|e| format!("Erro na requisição: {}", e))?;

    // Check if redirect ended up in verification challenge
    let final_url = resp.url().as_str();
    if final_url.contains("account-verification")
        || final_url.contains("gz/login")
        || final_url.contains("cf-challenge")
    {
        return Err("Redirecionado para verificação anti-bot".to_string());
    }

    if !resp.status().is_success() {
        return Err(format!("Status HTTP {}", resp.status()));
    }

    let text = resp
        .text()
        .await
        .map_err(|e| format!("Erro ao ler HTML: {}", e))?;

    Ok(text)
}

fn parse_price_str(raw: &str) -> Option<f64> {
    // Examples: "282", "282.00", "1.299,50", "R$ 1.450,00", "299,90"
    let cleaned = raw
        .replace("R$", "")
        .replace("BRL", "")
        .replace("$", "")
        .replace("&nbsp;", "")
        .replace('\u{00A0}', "")
        .trim()
        .to_string();

    if cleaned.is_empty() {
        return None;
    }

    // Both '.' and ',' present -> "1.299,50" -> remove dot, replace comma with dot
    if cleaned.contains('.') && cleaned.contains(',') {
        let normalized = cleaned.replace('.', "").replace(',', ".");
        return normalized.parse::<f64>().ok();
    }

    // Only ',' present -> "299,50" -> "299.50"
    if cleaned.contains(',') {
        let normalized = cleaned.replace(',', ".");
        return normalized.parse::<f64>().ok();
    }

    // Only digits or simple float "282" or "282.00"
    cleaned.parse::<f64>().ok()
}

fn extract_price_from_text(text: &str) -> Option<f64> {
    // Search for pattern like R$ 282 or R$ 1.250,50
    if let Some(pos) = text.find("R$") {
        let slice = &text[pos + 2..];
        let mut num_str = String::new();
        for ch in slice.trim_start().chars() {
            if ch.is_ascii_digit() || ch == '.' || ch == ',' {
                num_str.push(ch);
            } else {
                break;
            }
        }
        if !num_str.is_empty() {
            return parse_price_str(&num_str);
        }
    }
    None
}

fn extract_from_json_ld(val: &serde_json::Value, image_url: &mut String, price: &mut f64) {
    match val {
        serde_json::Value::Object(map) => {
            // Check image
            if image_url.is_empty() {
                if let Some(serde_json::Value::String(img)) = map.get("image") {
                    *image_url = img.clone();
                } else if let Some(serde_json::Value::Array(arr)) = map.get("image") {
                    if let Some(serde_json::Value::String(first_img)) = arr.first() {
                        *image_url = first_img.clone();
                    }
                }
            }

            // Check offers -> price
            if *price == 0.0 {
                if let Some(offers) = map.get("offers") {
                    match offers {
                        serde_json::Value::Object(offer_map) => {
                            if let Some(p) = offer_map.get("price") {
                                if let Some(n) = p.as_f64() {
                                    *price = n;
                                } else if let Some(s) = p.as_str() {
                                    if let Some(val) = parse_price_str(s) {
                                        *price = val;
                                    }
                                }
                            }
                        }
                        serde_json::Value::Array(offers_arr) => {
                            if let Some(serde_json::Value::Object(first_offer)) = offers_arr.first() {
                                if let Some(p) = first_offer.get("price") {
                                    if let Some(n) = p.as_f64() {
                                        *price = n;
                                    } else if let Some(s) = p.as_str() {
                                        if let Some(val) = parse_price_str(s) {
                                            *price = val;
                                        }
                                    }
                                }
                            }
                        }
                        _ => {}
                    }
                }
            }

            // Recurse into @graph or nested items
            if let Some(graph) = map.get("@graph") {
                extract_from_json_ld(graph, image_url, price);
            }
        }
        serde_json::Value::Array(arr) => {
            for item in arr {
                extract_from_json_ld(item, image_url, price);
                if !image_url.is_empty() && *price > 0.0 {
                    break;
                }
            }
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_scrape_mercadolivre() {
        let url = "https://www.mercadolivre.com.br/relogio-casio-masculino-calculadora-dbc-32-1adf-preto/p/MLB21719571";
        let res = scrape_product_url(url).await;
        assert!(res.is_ok(), "Scrape failed: {:?}", res.err());
        let data = res.unwrap();
        println!("Title: {}", data.title);
        println!("Image: {}", data.image_url);
        println!("Price: {}", data.price);
        assert!(!data.image_url.is_empty(), "Image should not be empty");
        assert!(data.image_url.starts_with("http"), "Image should be a valid URL");
        assert!(data.title.contains("Relógio Casio"), "Title should contain product name");
        assert!(data.price > 0.0, "Price should be greater than 0");
    }
}

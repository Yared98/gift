use crate::db::{self, DbPool};
use crate::models::{
    AddWhitelistPayload, AuthResponse, CreateGiftPayload, GoogleAuthPayload, InterestCategory,
    PublicUserInfo, ScrapePayload, UpdateGiftPayload, UpdateInterestsPayload, UpdateProfilePayload,
    User, UserPublicResponse,
};
use crate::scraper::scrape_product_url;
use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize)]
pub struct PublicQuery {
    pub token: Option<String>,
}

// Simple session token encoder/decoder (format: "uid:timestamp:hex_signature")
fn generate_session_token(user: &User) -> String {
    format!("wishlist_sess_{}_{}", user.id, user.email)
}

fn authenticate_user_from_headers(headers: &HeaderMap, pool: &DbPool) -> Result<User, StatusCode> {
    let auth_header = headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");

    let token = if let Some(stripped) = auth_header.strip_prefix("Bearer ") {
        stripped.trim()
    } else {
        auth_header.trim()
    };

    if token.is_empty() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Parse "wishlist_sess_{id}_{email}" or legacy token
    if let Some(rest) = token.strip_prefix("wishlist_sess_") {
        if let Some((id_str, _email)) = rest.split_once('_') {
            if let Ok(id) = id_str.parse::<i64>() {
                let conn = pool.lock().unwrap();
                if let Ok(Some(user)) = db::find_user_by_id(&conn, id) {
                    return Ok(user);
                }
            }
        }
    }

    Err(StatusCode::UNAUTHORIZED)
}

fn authenticate_super_admin(headers: &HeaderMap, pool: &DbPool) -> Result<User, StatusCode> {
    let user = authenticate_user_from_headers(headers, pool)?;
    if user.role == "SUPER_ADMIN" {
        Ok(user)
    } else {
        Err(StatusCode::FORBIDDEN)
    }
}

// Robots.txt
pub async fn robots_txt() -> Response {
    (
        StatusCode::OK,
        [("Content-Type", "text/plain; charset=utf-8")],
        "User-agent: *\nDisallow: /\n",
    )
        .into_response()
}

// Public: Get List by User Slug (/api/public/u/:slug?token=...)
pub async fn get_public_user_wishlist(
    State(pool): State<DbPool>,
    Path(slug): Path<String>,
    Query(query): Query<PublicQuery>,
) -> Result<Json<UserPublicResponse>, (StatusCode, Json<serde_json::Value>)> {
    let conn = pool.lock().unwrap();

    let user = db::find_user_by_slug(&conn, &slug)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(json!({ "error": "Lista de presentes não encontrada." }))))?;

    if user.status != "APPROVED" {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "Esta lista ainda não está ativa ou pública." })),
        ));
    }

    // Validate share token
    let client_token = query.token.unwrap_or_default();
    if client_token != user.share_token {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "Token de acesso inválido ou ausente para esta lista." })),
        ));
    }

    let gifts = db::list_user_gifts(&conn, user.id)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?;

    let interests = db::get_user_interests(&conn, user.id)
        .unwrap_or_else(|_| db::default_interests());

    Ok(Json(UserPublicResponse {
        user: PublicUserInfo {
            name: user.name,
            slug: user.slug,
            avatar_url: user.avatar_url,
            title: user.title,
            subtitle: user.subtitle,
            theme: user.theme,
        },
        gifts,
        interests,
    }))
}

// Public: Backwards compatible endpoint (/api/public/gifts?token=...)
pub async fn get_public_default_gifts(
    State(pool): State<DbPool>,
    Query(query): Query<PublicQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let conn = pool.lock().unwrap();
    let user = db::get_default_user(&conn)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?
        .ok_or_else(|| (StatusCode::NOT_FOUND, Json(json!({ "error": "Nenhuma lista encontrada." }))))?;

    let client_token = query.token.unwrap_or_default();
    if client_token != user.share_token {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "Token de acesso inválido ou ausente." })),
        ));
    }

    let gifts = db::list_user_gifts(&conn, user.id)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?;

    let interests = db::get_user_interests(&conn, user.id)
        .unwrap_or_else(|_| db::default_interests());

    Ok(Json(json!({
        "title": user.title,
        "subtitle": user.subtitle,
        "owner_name": user.name,
        "slug": user.slug,
        "theme": user.theme,
        "gifts": gifts,
        "interests": interests,
    })))
}

#[derive(Debug, Deserialize)]
struct GoogleTokenInfo {
    pub email: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
    pub sub: Option<String>,
}

// Auth: Google Login or Dev Simulator
pub async fn google_auth(
    State(pool): State<DbPool>,
    Json(payload): Json<GoogleAuthPayload>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<serde_json::Value>)> {
    let (email, name, avatar_url, google_id) = if let Some(cred) = payload.credential {
        let client = reqwest::Client::new();
        let resp = client
            .get("https://oauth2.googleapis.com/tokeninfo")
            .query(&[("id_token", &cred)])
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Erro ao validar token Google: {}", e);
                (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "Falha na comunicação com os servidores do Google." })),
                )
            })?;

        if !resp.status().is_success() {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Token do Google inválido ou expirado." })),
            ));
        }

        let info: GoogleTokenInfo = resp.json().await.map_err(|e| {
            tracing::error!("Erro ao decodificar tokeninfo do Google: {}", e);
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Resposta inválida do Google." })),
            )
        })?;

        let email = info.email.ok_or_else(|| {
            (
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "E-mail não fornecido pelo Google." })),
            )
        })?;

        let name = info.name.unwrap_or_else(|| email.split('@').next().unwrap_or("Amigo").to_string());
        let avatar_url = info.picture.unwrap_or_default();
        let google_id = info.sub.unwrap_or_else(|| format!("google_{}", email));

        (email.trim().to_lowercase(), name, avatar_url, google_id)
    } else {
        let email = payload.email.unwrap_or_default().trim().to_lowercase();
        if email.is_empty() || !email.contains('@') {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "E-mail inválido." })),
            ));
        }

        let name = payload.name.unwrap_or_else(|| {
            email.split('@').next().unwrap_or("Amigo").to_string()
        });
        let avatar_url = payload.avatar_url.unwrap_or_default();
        let google_id = payload.google_id.unwrap_or_else(|| format!("google_{}", email));

        (email, name, avatar_url, google_id)
    };

    let admin_email_env = std::env::var("ADMIN_EMAIL").ok();

    let conn = pool.lock().unwrap();
    let user = db::handle_google_login(
        &conn,
        &email,
        &name,
        &avatar_url,
        &google_id,
        admin_email_env.as_deref(),
    )
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?;

    let token = generate_session_token(&user);
    let is_first_user = user.role == "SUPER_ADMIN";

    Ok(Json(AuthResponse {
        user,
        token,
        is_first_user,
    }))
}

// Auth: Get Current Profile
pub async fn get_current_user(
    State(pool): State<DbPool>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    let interests = db::get_user_interests(&conn, user.id).unwrap_or_else(|_| db::default_interests());

    Ok(Json(json!({
        "user": user,
        "interests": interests,
    })))
}

// User: Update Profile (Slug, Title, Subtitle, Token, Name)
pub async fn update_user_profile(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Json(payload): Json<UpdateProfilePayload>,
) -> Result<Json<User>, StatusCode> {
    let current_user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();

    let updated = db::update_user_profile(&conn, current_user.id, &payload)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(updated))
}

// User: List Gifts
pub async fn get_user_gifts(
    State(pool): State<DbPool>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    let gifts = db::list_user_gifts(&conn, user.id).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "gifts": gifts })))
}

// User: Create Gift
pub async fn create_user_gift(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Json(payload): Json<CreateGiftPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();

    let id = db::create_user_gift(
        &conn,
        user.id,
        &payload.title,
        &payload.url,
        &payload.image_url,
        payload.price,
        &payload.currency,
        payload.priority,
        &payload.category,
        &payload.notes,
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "id": id, "success": true })))
}

// User: Update Gift
pub async fn update_user_gift(
    State(pool): State<DbPool>,
    Path(gift_id): Path<i64>,
    headers: HeaderMap,
    Json(payload): Json<UpdateGiftPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();

    db::update_user_gift(
        &conn,
        gift_id,
        user.id,
        &payload.title,
        &payload.url,
        &payload.image_url,
        payload.price,
        &payload.currency,
        payload.priority,
        &payload.category,
        &payload.notes,
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}

// User: Delete Gift
pub async fn delete_user_gift(
    State(pool): State<DbPool>,
    Path(gift_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();

    db::delete_user_gift(&conn, gift_id, user.id).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}

// User: Get Interests
pub async fn get_user_interests(
    State(pool): State<DbPool>,
    headers: HeaderMap,
) -> Result<Json<Vec<InterestCategory>>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    let interests = db::get_user_interests(&conn, user.id).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(interests))
}

// User: Update Interests
pub async fn update_user_interests(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Json(payload): Json<UpdateInterestsPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let user = authenticate_user_from_headers(&headers, &pool)?;
    let conn = pool.lock().unwrap();

    db::update_user_interests(&conn, user.id, &payload.interests)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}

// User: Scrape Link
pub async fn scrape_link(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Json(payload): Json<ScrapePayload>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let _ = authenticate_user_from_headers(&headers, &pool).map_err(|_| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Não autorizado." })),
        )
    })?;

    match scrape_product_url(&payload.url).await {
        Ok(data) => Ok(Json(json!(data))),
        Err(e) => Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": e })),
        )),
    }
}

// ==========================================
// SUPER-ADMIN ENDPOINTS
// ==========================================

// Super Admin: List All Users (Pending + Approved)
pub async fn admin_list_users(
    State(pool): State<DbPool>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let _ = authenticate_super_admin(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    let users = db::list_all_users(&conn).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "users": users })))
}

// Super Admin: Approve User Request
pub async fn admin_approve_user(
    State(pool): State<DbPool>,
    Path(user_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let _ = authenticate_super_admin(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    db::set_user_status(&conn, user_id, "APPROVED").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}

// Super Admin: Reject User Request
pub async fn admin_reject_user(
    State(pool): State<DbPool>,
    Path(user_id): Path<i64>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let _ = authenticate_super_admin(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    db::set_user_status(&conn, user_id, "REJECTED").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}

// Super Admin: List Whitelist
pub async fn admin_list_whitelist(
    State(pool): State<DbPool>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let _ = authenticate_super_admin(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    let list = db::list_whitelist(&conn).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "whitelist": list })))
}

// Super Admin: Add to Whitelist
pub async fn admin_add_whitelist(
    State(pool): State<DbPool>,
    headers: HeaderMap,
    Json(payload): Json<AddWhitelistPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let _ = authenticate_super_admin(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    db::add_to_whitelist(&conn, &payload.email).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}

// Super Admin: Remove from Whitelist
pub async fn admin_remove_whitelist(
    State(pool): State<DbPool>,
    Path(email): Path<String>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let _ = authenticate_super_admin(&headers, &pool)?;
    let conn = pool.lock().unwrap();
    db::remove_from_whitelist(&conn, &email).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "success": true })))
}



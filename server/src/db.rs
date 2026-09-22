use crate::models::{Gift, InterestCategory, UpdateProfilePayload, User, WhitelistEntry};
use rusqlite::{params, Connection, Result};
use std::sync::{Arc, Mutex};

pub type DbPool = Arc<Mutex<Connection>>;

pub fn default_interests() -> Vec<InterestCategory> {
    vec![
        InterestCategory {
            id: "sagas".to_string(),
            title: "Sagas, Filmes & Séries".to_string(),
            icon: "Film".to_string(),
            tags: vec![
                "O Senhor dos Anéis".to_string(),
                "Star Wars".to_string(),
                "Studio Ghibli".to_string(),
                "Duna".to_string(),
                "Interestelar".to_string(),
                "Blade Runner".to_string(),
            ],
            notes: "Adoro artbooks, livros de capa dura e pôsteres minimalistas dessas obras.".to_string(),
        },
        InterestCategory {
            id: "musica".to_string(),
            title: "Músicas, Bandas & Estilos".to_string(),
            icon: "Music".to_string(),
            tags: vec![
                "Rock Clássico".to_string(),
                "Pink Floyd".to_string(),
                "MPB".to_string(),
                "Daft Punk".to_string(),
                "Indie Rock".to_string(),
                "Jazz & Lo-fi".to_string(),
            ],
            notes: "Fã de discos de vinil, camisetas de bandas e biografias musicais.".to_string(),
        },
        InterestCategory {
            id: "jogos".to_string(),
            title: "Jogos & Universos Gamer".to_string(),
            icon: "Gamepad2".to_string(),
            tags: vec![
                "The Legend of Zelda".to_string(),
                "Baldur's Gate 3".to_string(),
                "Elden Ring".to_string(),
                "RPGs de Mesa".to_string(),
                "Nintendo Switch".to_string(),
            ],
            notes: "Gosto de miniaturas, mousepads temáticos e itens decorativos de games.".to_string(),
        },
        InterestCategory {
            id: "medidas".to_string(),
            title: "Medidas & Preferências Pessoais".to_string(),
            icon: "Shirt".to_string(),
            tags: vec![
                "Camiseta: M".to_string(),
                "Calçado: 41".to_string(),
                "Cores: Verde Musgo / Preto / Grafite".to_string(),
                "Anel: 18".to_string(),
            ],
            notes: "Cortes clássicos, tecidos naturais (algodão, linho ou lã) e sem estampas espalhafatosas.".to_string(),
        },
    ]
}

pub fn init_db(db_path: &str) -> Result<DbPool> {
    let conn = Connection::open(db_path)?;

    // Enable foreign keys
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    // Create Tables
    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT DEFAULT '',
            slug TEXT UNIQUE NOT NULL,
            share_token TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            status TEXT NOT NULL DEFAULT 'PENDING',
            title TEXT DEFAULT 'Minha Lista de Presentes',
            subtitle TEXT DEFAULT '',
            theme TEXT DEFAULT 'salvia',
            interests_json TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS whitelist (
            email TEXT PRIMARY KEY,
            added_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS gifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            title TEXT NOT NULL,
            url TEXT NOT NULL DEFAULT '',
            image_url TEXT NOT NULL DEFAULT '',
            price REAL NOT NULL DEFAULT 0.0,
            currency TEXT NOT NULL DEFAULT 'BRL',
            priority INTEGER NOT NULL DEFAULT 2,
            category TEXT NOT NULL DEFAULT 'Geral',
            notes TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        "#,
    )?;

    // Migration: add user_id column to gifts if table already existed without it
    let user_id_exists = {
        let mut pragma_stmt = conn.prepare("PRAGMA table_info(gifts)")?;
        let columns = pragma_stmt.query_map([], |row| row.get::<_, String>(1))?;
        let mut found = false;
        for col in columns {
            if let Ok(c) = col {
                if c == "user_id" {
                    found = true;
                    break;
                }
            }
        }
        found
    };

    if !user_id_exists {
        let _ = conn.execute("ALTER TABLE gifts ADD COLUMN user_id INTEGER DEFAULT 1", []);
    }

    // Migration: add theme column to users if table already existed without it
    let theme_exists = {
        let mut pragma_stmt = conn.prepare("PRAGMA table_info(users)")?;
        let columns = pragma_stmt.query_map([], |row| row.get::<_, String>(1))?;
        let mut found = false;
        for col in columns {
            if let Ok(c) = col {
                if c == "theme" {
                    found = true;
                    break;
                }
            }
        }
        found
    };

    if !theme_exists {
        let _ = conn.execute("ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'salvia'", []);
    }

    // Seed default admin user if users table is empty
    let users_count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))?;
    if users_count == 0 {
        let default_interests_json = serde_json::to_string(&default_interests()).unwrap();
        let now = "2026-09-21T00:00:00Z";

        conn.execute(
            "INSERT INTO users (id, google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, interests_json, created_at, updated_at) 
             VALUES (1, 'mock-admin', 'admin@local', 'Mariana', '', 'mariana', 'amigos2026', 'SUPER_ADMIN', 'APPROVED', 'Minha Lista de Presentes', 'Ideias de presentes para quem quer me mimar nas ocasiões especiais.', 'salvia', ?1, ?2, ?2)",
            params![default_interests_json, now],
        )?;

        // Ensure existing gifts point to user_id = 1
        let _ = conn.execute("UPDATE gifts SET user_id = 1 WHERE user_id IS NULL OR user_id = 0", []);
    }

    Ok(Arc::new(Mutex::new(conn)))
}

// User retrieval helpers
pub fn find_user_by_id(conn: &Connection, id: i64) -> Result<Option<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, created_at, updated_at 
         FROM users WHERE id = ?1",
    )?;
    let mut rows = stmt.query(params![id])?;
    if let Some(row) = rows.next()? {
        Ok(Some(map_user_row(row)?))
    } else {
        Ok(None)
    }
}

pub fn find_user_by_email(conn: &Connection, email: &str) -> Result<Option<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, created_at, updated_at 
         FROM users WHERE lower(email) = lower(?1)",
    )?;
    let mut rows = stmt.query(params![email])?;
    if let Some(row) = rows.next()? {
        Ok(Some(map_user_row(row)?))
    } else {
        Ok(None)
    }
}

pub fn find_user_by_slug(conn: &Connection, slug: &str) -> Result<Option<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, created_at, updated_at 
         FROM users WHERE lower(slug) = lower(?1)",
    )?;
    let mut rows = stmt.query(params![slug])?;
    if let Some(row) = rows.next()? {
        Ok(Some(map_user_row(row)?))
    } else {
        Ok(None)
    }
}

pub fn get_default_user(conn: &Connection) -> Result<Option<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, created_at, updated_at 
         FROM users WHERE role = 'SUPER_ADMIN' ORDER BY id ASC LIMIT 1",
    )?;
    let mut rows = stmt.query([])?;
    if let Some(row) = rows.next()? {
        Ok(Some(map_user_row(row)?))
    } else {
        Ok(None)
    }
}

fn map_user_row(row: &rusqlite::Row) -> Result<User> {
    Ok(User {
        id: row.get(0)?,
        google_id: row.get::<_, Option<String>>(1)?.unwrap_or_default(),
        email: row.get(2)?,
        name: row.get(3)?,
        avatar_url: row.get::<_, Option<String>>(4)?.unwrap_or_default(),
        slug: row.get(5)?,
        share_token: row.get(6)?,
        role: row.get(7)?,
        status: row.get(8)?,
        title: row.get::<_, Option<String>>(9)?.unwrap_or_else(|| "Minha Lista de Presentes".to_string()),
        subtitle: row.get::<_, Option<String>>(10)?.unwrap_or_default(),
        theme: row.get::<_, Option<String>>(11)?.unwrap_or_else(|| "salvia".to_string()),
        created_at: row.get(12)?,
        updated_at: row.get(13)?,
    })
}

// Whitelist helpers
pub fn is_in_whitelist(conn: &Connection, email: &str) -> bool {
    let count: Result<i64> = conn.query_row(
        "SELECT COUNT(*) FROM whitelist WHERE lower(email) = lower(?1)",
        params![email],
        |r| r.get(0),
    );
    count.unwrap_or(0) > 0
}

pub fn list_whitelist(conn: &Connection) -> Result<Vec<WhitelistEntry>> {
    let mut stmt = conn.prepare("SELECT email, added_at FROM whitelist ORDER BY added_at DESC")?;
    let rows = stmt.query_map([], |row| {
        Ok(WhitelistEntry {
            email: row.get(0)?,
            added_at: row.get(1)?,
        })
    })?;
    let mut list = Vec::new();
    for item in rows {
        list.push(item?);
    }
    Ok(list)
}

pub fn add_to_whitelist(conn: &Connection, email: &str) -> Result<()> {
    let now = chrono_now();
    conn.execute(
        "INSERT OR IGNORE INTO whitelist (email, added_at) VALUES (lower(?1), ?2)",
        params![email, now],
    )?;
    // If a user with this email was pending, auto-approve them!
    conn.execute(
        "UPDATE users SET status = 'APPROVED' WHERE lower(email) = lower(?1) AND status = 'PENDING'",
        params![email],
    )?;
    Ok(())
}

pub fn remove_from_whitelist(conn: &Connection, email: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM whitelist WHERE lower(email) = lower(?1)",
        params![email],
    )?;
    Ok(())
}

// Google OAuth / Login handling
pub fn handle_google_login(
    conn: &Connection,
    email: &str,
    name: &str,
    avatar_url: &str,
    google_id: &str,
    admin_email_env: Option<&str>,
) -> Result<User> {
    let now = chrono_now();

    let is_admin_by_env = admin_email_env.map_or(false, |a| a.eq_ignore_ascii_case(email));

    if let Some(existing) = find_user_by_email(conn, email)? {
        // Promote to SUPER_ADMIN if matches ADMIN_EMAIL
        if is_admin_by_env && (existing.role != "SUPER_ADMIN" || existing.status != "APPROVED") {
            let _ = conn.execute(
                "UPDATE users SET role = 'SUPER_ADMIN', status = 'APPROVED' WHERE id = ?1",
                params![existing.id],
            );
        }

        // Update name and avatar
        conn.execute(
            "UPDATE users SET name = ?1, avatar_url = ?2, google_id = ?3, updated_at = ?4 WHERE id = ?5",
            params![name, avatar_url, google_id, now, existing.id],
        )?;
        return Ok(find_user_by_id(conn, existing.id)?.unwrap());
    }

    // Check if there is already any SUPER_ADMIN
    let super_admin_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM users WHERE role = 'SUPER_ADMIN'",
        [],
        |r| r.get(0),
    )?;

    let is_first_user = super_admin_count == 0;
    let in_whitelist = is_in_whitelist(conn, email);

    let (role, status) = if is_admin_by_env || is_first_user {
        ("SUPER_ADMIN", "APPROVED")
    } else if in_whitelist {
        ("USER", "APPROVED")
    } else {
        ("USER", "PENDING")
    };

    // Generate clean slug from email or name
    let base_slug = email.split('@').next().unwrap_or("lista").to_lowercase();
    let mut slug = sanitize_slug(&base_slug);
    let mut counter = 1;
    while find_user_by_slug(conn, &slug)?.is_some() {
        slug = format!("{}-{}", sanitize_slug(&base_slug), counter);
        counter += 1;
    }

    let share_token = format!("{}-{}", slug, &now[..6].replace(['-', ':', 'T'], ""));
    let default_interests_json = serde_json::to_string(&default_interests()).unwrap();

    conn.execute(
        "INSERT INTO users (google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, interests_json, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'salvia', ?11, ?12, ?12)",
        params![
            google_id,
            email,
            name,
            avatar_url,
            slug,
            share_token,
            role,
            status,
            format!("Lista de {}", name),
            "Ideias de presentes que eu gostaria de ganhar nas ocasiões especiais.",
            default_interests_json,
            now
        ],
    )?;

    let id = conn.last_insert_rowid();
    Ok(find_user_by_id(conn, id)?.unwrap())
}

pub fn list_all_users(conn: &Connection) -> Result<Vec<User>> {
    let mut stmt = conn.prepare(
        "SELECT id, google_id, email, name, avatar_url, slug, share_token, role, status, title, subtitle, theme, created_at, updated_at 
         FROM users ORDER BY role DESC, created_at DESC",
    )?;
    let rows = stmt.query_map([], |row| map_user_row(row))?;
    let mut list = Vec::new();
    for item in rows {
        list.push(item?);
    }
    Ok(list)
}

pub fn set_user_status(conn: &Connection, user_id: i64, status: &str) -> Result<()> {
    let now = chrono_now();
    conn.execute(
        "UPDATE users SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params![status, now, user_id],
    )?;
    Ok(())
}

pub fn update_user_profile(conn: &Connection, user_id: i64, payload: &UpdateProfilePayload) -> Result<User> {
    let now = chrono_now();
    let user = find_user_by_id(conn, user_id)?.ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)?;

    let name = payload.name.clone().unwrap_or(user.name);
    let title = payload.title.clone().unwrap_or(user.title);
    let subtitle = payload.subtitle.clone().unwrap_or(user.subtitle);
    let share_token = payload.share_token.clone().unwrap_or(user.share_token);
    let theme = payload.theme.clone().unwrap_or(user.theme);

    let slug = if let Some(s) = &payload.slug {
        let clean = sanitize_slug(s);
        if !clean.is_empty() {
            // Check if slug taken by someone else
            if let Some(other) = find_user_by_slug(conn, &clean)? {
                if other.id != user_id {
                    user.slug
                } else {
                    clean
                }
            } else {
                clean
            }
        } else {
            user.slug
        }
    } else {
        user.slug
    };

    conn.execute(
        "UPDATE users SET name = ?1, slug = ?2, share_token = ?3, title = ?4, subtitle = ?5, theme = ?6, updated_at = ?7 WHERE id = ?8",
        params![name, slug, share_token, title, subtitle, theme, now, user_id],
    )?;

    Ok(find_user_by_id(conn, user_id)?.unwrap())
}

// User Gifts CRUD
pub fn list_user_gifts(conn: &Connection, user_id: i64) -> Result<Vec<Gift>> {
    let mut stmt = conn.prepare(
        "SELECT id, user_id, title, url, image_url, price, currency, priority, category, notes, created_at, updated_at 
         FROM gifts WHERE user_id = ?1 ORDER BY priority ASC, id DESC",
    )?;
    let rows = stmt.query_map(params![user_id], |row| {
        Ok(Gift {
            id: row.get(0)?,
            user_id: row.get(1)?,
            title: row.get(2)?,
            url: row.get(3)?,
            image_url: row.get(4)?,
            price: row.get(5)?,
            currency: row.get(6)?,
            priority: row.get(7)?,
            category: row.get(8)?,
            notes: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })?;

    let mut list = Vec::new();
    for g in rows {
        list.push(g?);
    }
    Ok(list)
}

pub fn create_user_gift(
    conn: &Connection,
    user_id: i64,
    title: &str,
    url: &str,
    image_url: &str,
    price: f64,
    currency: &str,
    priority: i32,
    category: &str,
    notes: &str,
) -> Result<i64> {
    let now = chrono_now();
    conn.execute(
        "INSERT INTO gifts (user_id, title, url, image_url, price, currency, priority, category, notes, created_at, updated_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)",
        params![user_id, title, url, image_url, price, currency, priority, category, notes, now],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn update_user_gift(
    conn: &Connection,
    gift_id: i64,
    user_id: i64,
    title: &str,
    url: &str,
    image_url: &str,
    price: f64,
    currency: &str,
    priority: i32,
    category: &str,
    notes: &str,
) -> Result<()> {
    let now = chrono_now();
    conn.execute(
        "UPDATE gifts SET title = ?1, url = ?2, image_url = ?3, price = ?4, currency = ?5, priority = ?6, category = ?7, notes = ?8, updated_at = ?9 
         WHERE id = ?10 AND user_id = ?11",
        params![title, url, image_url, price, currency, priority, category, notes, now, gift_id, user_id],
    )?;
    Ok(())
}

pub fn delete_user_gift(conn: &Connection, gift_id: i64, user_id: i64) -> Result<()> {
    conn.execute(
        "DELETE FROM gifts WHERE id = ?1 AND user_id = ?2",
        params![gift_id, user_id],
    )?;
    Ok(())
}

// User Interests
pub fn get_user_interests(conn: &Connection, user_id: i64) -> Result<Vec<InterestCategory>> {
    let mut stmt = conn.prepare("SELECT interests_json FROM users WHERE id = ?1")?;
    let mut rows = stmt.query(params![user_id])?;
    if let Some(row) = rows.next()? {
        let json_str: String = row.get(0)?;
        if let Ok(interests) = serde_json::from_str(&json_str) {
            return Ok(interests);
        }
    }
    Ok(default_interests())
}

pub fn update_user_interests(conn: &Connection, user_id: i64, interests: &[InterestCategory]) -> Result<()> {
    let now = chrono_now();
    let json_str = serde_json::to_string(interests).unwrap_or_else(|_| "[]".to_string());
    conn.execute(
        "UPDATE users SET interests_json = ?1, updated_at = ?2 WHERE id = ?3",
        params![json_str, now, user_id],
    )?;
    Ok(())
}

fn sanitize_slug(input: &str) -> String {
    input
        .to_lowercase()
        .chars()
        .filter_map(|c| {
            if c.is_alphanumeric() {
                Some(c)
            } else if c == '-' || c == '_' || c == ' ' {
                Some('-')
            } else {
                None
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string()
}

fn chrono_now() -> String {
    let now = std::time::SystemTime::now();
    let duration = now
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    format!("{}.{:03}Z", duration.as_secs(), duration.subsec_millis())
}

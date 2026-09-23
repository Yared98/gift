mod db;
mod models;
mod routes;
mod scraper;

use axum::{
    extract::Request,
    http::{header, HeaderValue},
    middleware::{self, Next},
    response::Response,
    routing::{delete, get, post, put},
    Router,
};
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

async fn add_noindex_headers(req: Request, next: Next) -> Response {
    let mut response = next.run(req).await;
    response.headers_mut().insert(
        header::HeaderName::from_static("x-robots-tag"),
        HeaderValue::from_static("noindex, nofollow, noarchive, nosnippet"),
    );
    response
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,server=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Data directory for SQLite
    let data_dir = std::env::var("DATA_DIR").unwrap_or_else(|_| "./data".to_string());
    std::fs::create_dir_all(&data_dir)?;
    let db_path = format!("{}/wishlist.db", data_dir);

    tracing::info!("Inicializando banco de dados em: {}", db_path);
    let pool = db::init_db(&db_path)?;

    // CORS for development & API access
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Identify client dist directory
    let client_dist = if Path::new("./client/dist").exists() {
        PathBuf::from("./client/dist")
    } else if Path::new("../client/dist").exists() {
        PathBuf::from("../client/dist")
    } else {
        PathBuf::from("./dist")
    };

    // Build Router
    let app = Router::new()
        .route("/robots.txt", get(routes::robots_txt))
        // Public routes
        .route("/api/public/u/:slug", get(routes::get_public_user_wishlist))
        .route("/api/public/gifts", get(routes::get_public_default_gifts))
        // Auth routes
        .route("/api/auth/google", post(routes::google_auth))
        .route("/api/auth/me", get(routes::get_current_user))
        // User workspace routes
        .route("/api/user/gifts", get(routes::get_user_gifts).post(routes::create_user_gift))
        .route("/api/user/gifts/:id", put(routes::update_user_gift).delete(routes::delete_user_gift))
        .route("/api/user/profile", put(routes::update_user_profile))
        .route("/api/user/interests", get(routes::get_user_interests).put(routes::update_user_interests))
        .route("/api/user/scrape", post(routes::scrape_link))
        .route("/api/scrape", post(routes::scrape_link))
        // Super-admin routes
        .route("/api/admin/users", get(routes::admin_list_users))
        .route("/api/admin/users/:id/approve", post(routes::admin_approve_user))
        .route("/api/admin/users/:id/reject", post(routes::admin_reject_user))
        .route("/api/admin/whitelist", get(routes::admin_list_whitelist).post(routes::admin_add_whitelist))
        .route("/api/admin/whitelist/:email", delete(routes::admin_remove_whitelist))
        .with_state(pool)
        .nest_service("/assets", ServeDir::new(client_dist.join("assets")))
        .fallback_service(
            ServeDir::new(&client_dist)
                .fallback(ServeFile::new(client_dist.join("index.html"))),
        )
        .layer(middleware::from_fn(add_noindex_headers))
        .layer(cors);

    // Port & Host
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Servidor rodando em http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gift {
    pub id: i64,
    pub user_id: i64,
    pub title: String,
    pub url: String,
    pub image_url: String,
    pub price: f64,
    pub currency: String,
    pub priority: i32,
    pub category: String,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateGiftPayload {
    pub title: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub image_url: String,
    #[serde(default)]
    pub price: f64,
    #[serde(default = "default_currency")]
    pub currency: String,
    #[serde(default = "default_priority")]
    pub priority: i32,
    #[serde(default = "default_category")]
    pub category: String,
    #[serde(default)]
    pub notes: String,
}

fn default_currency() -> String {
    "BRL".to_string()
}

fn default_priority() -> i32 {
    2
}

fn default_category() -> String {
    "Geral".to_string()
}

#[derive(Debug, Deserialize)]
pub struct UpdateGiftPayload {
    pub title: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub image_url: String,
    #[serde(default)]
    pub price: f64,
    #[serde(default = "default_currency")]
    pub currency: String,
    #[serde(default = "default_priority")]
    pub priority: i32,
    #[serde(default = "default_category")]
    pub category: String,
    #[serde(default)]
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterestCategory {
    pub id: String,
    pub title: String,
    pub icon: String,
    pub tags: Vec<String>,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub google_id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: String,
    pub slug: String,
    pub share_token: String,
    pub role: String,   // "SUPER_ADMIN" | "USER"
    pub status: String, // "APPROVED" | "PENDING" | "REJECTED"
    pub title: String,
    pub subtitle: String,
    pub theme: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhitelistEntry {
    pub email: String,
    pub added_at: String,
}

#[derive(Debug, Deserialize)]
pub struct GoogleAuthPayload {
    pub email: Option<String>,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
    pub google_id: Option<String>,
    pub credential: Option<String>, // ID token when using official Google Sign-In
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfilePayload {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub share_token: Option<String>,
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub theme: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInterestsPayload {
    pub interests: Vec<InterestCategory>,
}

#[derive(Debug, Deserialize)]
pub struct AddWhitelistPayload {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct PublicUserInfo {
    pub name: String,
    pub slug: String,
    pub avatar_url: String,
    pub title: String,
    pub subtitle: String,
    pub theme: String,
}

#[derive(Debug, Serialize)]
pub struct UserPublicResponse {
    pub user: PublicUserInfo,
    pub gifts: Vec<Gift>,
    pub interests: Vec<InterestCategory>,
}

#[derive(Debug, Deserialize)]
pub struct ScrapePayload {
    pub url: String,
}

#[derive(Debug, Serialize)]
pub struct ScrapeResponse {
    pub title: String,
    pub image_url: String,
    pub price: f64,
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: User,
    pub token: String,
    pub is_first_user: bool,
}

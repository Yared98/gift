export interface Gift {
  id: number;
  user_id?: number;
  title: string;
  url: string;
  image_url: string;
  price: number;
  currency: string;
  priority: number; // 1: Favorito (❤️), 2: Padrão
  category: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface InterestCategory {
  id: string;
  title: string;
  icon: string;
  tags: string[];
  notes: string;
}

export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string;
  slug: string;
  share_token: string;
  role: 'SUPER_ADMIN' | 'USER';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  title: string;
  subtitle: string;
  theme?: string;
  created_at: string;
  updated_at: string;
}

export interface WhitelistEntry {
  email: string;
  added_at: string;
}

export interface PublicUserInfo {
  name: string;
  slug: string;
  avatar_url: string;
  title: string;
  subtitle: string;
  theme?: string;
}

export interface PublicWishlistData {
  user: PublicUserInfo;
  gifts: Gift[];
  interests: InterestCategory[];
}

export interface PublicSettings {
  title: string;
  subtitle: string;
  owner_name: string;
  slug?: string;
  total_items: number;
  valid_token: boolean;
  theme?: string;
  interests?: InterestCategory[];
}

export interface AdminSettings {
  title: string;
  subtitle: string;
  owner_name: string;
  share_token: string;
  slug?: string;
  theme?: string;
  interests?: InterestCategory[];
}

export interface ScrapeResponse {
  title: string;
  image_url: string;
  price: number;
  description: string;
}

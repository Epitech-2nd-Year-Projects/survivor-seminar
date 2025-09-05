export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  founder_id?: number;
  investor_id?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterResponse {
  user: User;
  tokens: TokenPair;
}

export interface RegisterFormData {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

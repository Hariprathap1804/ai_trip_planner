export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

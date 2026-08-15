export interface RegisterPayload {
  username: string;
  email: string;
  contact: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  contact: string;
  role?: "buyer" | "seller";
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  user?: User;
}
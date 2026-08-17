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

export type UserRole = "owner" | "tenant";


export interface UserAvatar {
  url: string;
  fileId: string;
  type?: "default" | "uploaded";
}

export interface User {
  _id: string;
  username: string;
  email: string;
  contact: string;

  role: UserRole;

  avatar?: UserAvatar;

  authProvider?: "local" | "google";
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  user?: User;
}
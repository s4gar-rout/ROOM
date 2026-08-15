import api from "@/lib/axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../../../types/auth.types";

export const registerUser = async (
  data: RegisterPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  data: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me");

  return response.data;
};

export const logoutUser = async (): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/logout"
  );

  return response.data;
};
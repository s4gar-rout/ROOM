import api from "@/lib/axios";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "../../../types/auth.types";

// ==========================================
// AUTH TYPES
// ==========================================

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyResetOtpResponse
  extends AuthResponse {
  resetToken?: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// ==========================================
// REGISTER
// ==========================================

export const registerUser = async (
  data: RegisterPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data;
};

// ==========================================
// LOGIN
// ==========================================

export const loginUser = async (
  data: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

// ==========================================
// GET CURRENT USER
// ==========================================

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>(
    "/auth/me"
  );

  return response.data;
};

// ==========================================
// LOGOUT
// ==========================================

export const logoutUser = async (): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/logout"
  );

  return response.data;
};

// ==========================================
// FORGOT PASSWORD
// POST /auth/forgot-password
// ==========================================

export const forgotPassword = async (
  data: ForgotPasswordPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/forgot-password",
    data
  );

  return response.data;
};

// ==========================================
// VERIFY RESET OTP
// POST /auth/verify-reset-otp
// ==========================================

export const verifyResetOtp = async (
  data: VerifyResetOtpPayload
): Promise<VerifyResetOtpResponse> => {
  const response =
    await api.post<VerifyResetOtpResponse>(
      "/auth/verify-reset-otp",
      data
    );

  return response.data;
};

// ==========================================
// RESET PASSWORD
// POST /auth/reset-password
// ==========================================

export const resetPassword = async (
  data: ResetPasswordPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/reset-password",
    data
  );

  return response.data;
};
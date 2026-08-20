import api, { setAccessToken } from "@/lib/axios";

import type {
  LoginPayload,
  RegisterPayload,
  User,
} from "../../../types/auth.types";

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  sessionId?: string;
  accessToken?: string;
}

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

export interface VerifyResetOtpResponse extends AuthResponse {
  resetToken?: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// ==========================================
// REGISTER & VERIFY EMAIL
// ==========================================

export const registerUser = async (
  data: RegisterPayload
): Promise<AuthResponse & { requiresVerification?: boolean; email?: string }> => {
  const response = await api.post<AuthResponse & { requiresVerification?: boolean; email?: string }>(
    "/auth/register",
    data
  );

  return response.data;
};

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export const verifyEmail = async (
  data: VerifyEmailPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/verify-email", data);

  if (response.data.sessionId) {
    sessionStorage.setItem("roomSessionId", response.data.sessionId);
  }
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }

  return response.data;
};

export interface ResendVerificationOtpPayload {
  email: string;
}

export const resendVerificationOtp = async (
  data: ResendVerificationOtpPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/resend-verification-otp", data);
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

  if (response.data.sessionId) {
    sessionStorage.setItem("roomSessionId", response.data.sessionId);
  }
  if (response.data.accessToken) {
    setAccessToken(response.data.accessToken);
  }

  return response.data;
};

// ==========================================
// GET CURRENT USER
// ==========================================

interface CurrentUserResponse {
  success: boolean;
  user: User;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<CurrentUserResponse>(
    "/auth/me"
  );

  return response.data.user;
};

// ==========================================
// BECOME OWNER (SELF ROLE CONVERSION)
// ==========================================

export const becomeOwner = async (): Promise<AuthResponse> => {
  const response = await api.patch<AuthResponse>("/auth/become-owner");
  return response.data;
};

// ==========================================
// LOGOUT
// ==========================================

export const logoutUser =
  async (): Promise<AuthResponse> => {
    const response =
      await api.post<AuthResponse>(
        "/auth/logout"
      );

    sessionStorage.removeItem("roomSessionId");
    setAccessToken(null);

    return response.data;
  };

// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = async (
  data: ForgotPasswordPayload
): Promise<AuthResponse> => {
  const response =
    await api.post<AuthResponse>(
      "/auth/forgot-password",
      data
    );

  return response.data;
};

// ==========================================
// VERIFY RESET OTP
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
// ==========================================

export const resetPassword = async (
  data: ResetPasswordPayload
): Promise<AuthResponse> => {
  const response =
    await api.post<AuthResponse>(
      "/auth/reset-password",
      data
    );

  return response.data;
};
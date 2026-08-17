import api from "@/lib/axios";

// ==========================================
// TYPES
// ==========================================

export interface UserAvatar {
  type: "custom";
  url: string;
  fileId: string;
}

export interface ProfileUser {
  id: string;
  username: string;
  email: string;
  contact?: string;

  role: "user" | "tenant" | "owner" | "admin";

  avatar?: UserAvatar;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: ProfileUser;
}

export interface AvatarResponse {
  success: boolean;
  message?: string;
  avatar?: UserAvatar;
}


// ==========================================
// GET MY PROFILE
// ==========================================

export const getMyProfile =
  async (): Promise<ProfileResponse> => {
    const response =
      await api.get<ProfileResponse>(
        "/profile/me"
      );

    return response.data;
  };


// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = async (
  data: {
    role?: "user" | "tenant" | "owner";
    username?: string;
    contact?: string;
  }
): Promise<ProfileResponse> => {
  const response =
    await api.patch<ProfileResponse>(
      "/profile/update",
      data
    );

  return response.data;
};


// ==========================================
// UPLOAD PROFILE PHOTO
// ==========================================

export const updateAvatar = async (
  file: File
): Promise<AvatarResponse> => {
  if (!file) {
    throw new Error("Profile photo is required");
  }

  const formData = new FormData();

  formData.append("avatar", file);

  const response = await api.patch<AvatarResponse>(
    "/profile/avatar",
    formData
  );

  return response.data;
};
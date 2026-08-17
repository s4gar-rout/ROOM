import UserModel from "../models/user.model.js";
import {
    uploadFile,
    deleteFile,
} from "../services/storage.service.js";

// ==========================================
// GET MY PROFILE
// ==========================================

export async function getMyProfileController(req, res) {
    try {
        const user = await UserModel.findById(req.user._id).select(
            "-password -otp -otpExpiresAt -otpCooldownExpiresAt"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Get Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ==========================================
// UPDATE PROFILE
// ==========================================

export async function updateProfileController(req, res) {
    try {
        const { username, contact, role } = req.body;

        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ======================================
        // USERNAME
        // ======================================

        if (username !== undefined) {
            const normalizedUsername = username.trim();

            const existingUsername =
                await UserModel.findOne({
                    username: normalizedUsername,
                    _id: { $ne: user._id },
                });

            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists",
                });
            }

            user.username = normalizedUsername;
        }

        // ======================================
        // CONTACT
        // ======================================

        if (contact !== undefined) {
            user.contact = contact.trim();
        }

        // ======================================
        // ROLE
        // ======================================

        if (role !== undefined) {
            if (!["user", "tenant", "owner"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role",
                });
            }

            if (role === "user" || role === "tenant") {
                user.role = "tenant";
            } else if (role === "owner") {
                user.role = "owner";
            }
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                ownerVerified: user.ownerVerified,
                ownerRequestStatus:
                    user.ownerRequestStatus,
                avatar: user.avatar,
            },
        });

    } catch (error) {
        console.error("Update Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ==========================================
// UPDATE AVATAR
// ==========================================

export async function updateAvatarController(req, res) {
    try {
        console.log("========== AVATAR DEBUG ==========");
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);
        console.log("USER:", req.user?._id);
        console.log("===================================");

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Avatar image is required",
            });
        }

        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const result = await uploadFile({
            buffer: req.file.buffer,
            fileName: `avatar-${user._id}-${Date.now()}`,
            folder: "avatars",
        });

        if (user.avatar?.fileId) {
            try {
                await deleteFile(user.avatar.fileId);
            } catch (error) {
                console.error(
                    "Old Avatar Delete Error:",
                    error
                );
            }
        }

        user.avatar = {
            url: result.url,
            fileId: result.fileId,
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            avatar: user.avatar,
        });

    } catch (error) {
        console.error(
            "Update Avatar Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ==========================================
// CHANGE PASSWORD
// ==========================================

export async function changePasswordController(req, res) {
    try {
        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 8 characters",
            });
        }

        const user = await UserModel.findById(req.user._id)
            .select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message:
                    "Password change is not available for Google accounts",
            });
        }

        const isPasswordCorrect =
            await user.comparePassword(currentPassword);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const isSamePassword =
            await user.comparePassword(newPassword);

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password",
            });
        }

        user.password = newPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Change Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


export default {
    getMyProfileController,
    updateProfileController,
    updateAvatarController,
    changePasswordController,
};
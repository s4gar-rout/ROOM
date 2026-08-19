import UserModel from "../models/user.model.js";
import roomModel from "../models/room.model.js";
import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import PushSubscriptionModel from "../models/pushSubscription.model.js";
import NotificationModel from "../models/notification.model.js";
import {
    uploadFile,
    deleteFile,
} from "../services/storage.service.js";
import { sendAccountDeletionOtpEmail, sendAccountDeletedConfirmationEmail } from "../services/email.service.js";
import redis from "../services/redis.service.js";

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

// ==========================================
// SEND DELETE ACCOUNT OTP
// ==========================================

export async function sendDeleteAccountOtpController(req, res) {
    try {
        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const normalizedEmail = user.email.toLowerCase().trim();
        const otpKey = `delete-account:${normalizedEmail}`;
        const cooldownKey = `delete-account-cooldown:${normalizedEmail}`;

        // Check cooldown
        const cooldownExists = await redis.exists(cooldownKey);
        if (cooldownExists) {
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting another OTP",
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store in Redis for 10 minutes
        await redis.set(otpKey, otp, { ex: 10 * 60 });

        // Cooldown for 45 seconds
        await redis.set(cooldownKey, "1", { ex: 45 });

        // Send Email
        await sendAccountDeletionOtpEmail({
            email: user.email,
            username: user.username,
            otp,
        });

        return res.status(200).json({
            success: true,
            message: "Verification OTP has been sent to your email.",
        });
    } catch (error) {
        console.error("Send Delete Account OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send verification OTP",
        });
    }
}

// ==========================================
// VERIFY AND DELETE ACCOUNT
// ==========================================

export async function verifyAndDeleteAccountController(req, res) {
    try {
        const { otp } = req.body || {};

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Verification OTP is required",
            });
        }

        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const normalizedEmail = user.email.toLowerCase().trim();
        const normalizedOtp = otp.toString().trim();
        const otpKey = `delete-account:${normalizedEmail}`;

        const storedOtp = await redis.get(otpKey);

        if (!storedOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired or was not requested. Please request a new OTP.",
            });
        }

        if (String(storedOtp).trim() !== normalizedOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification OTP",
            });
        }

        // 1. Delete user avatar from ImageKit if exists
        if (user.avatar?.fileId) {
            try {
                await deleteFile(user.avatar.fileId);
            } catch (err) {
                console.error("Delete Avatar Error:", err.message);
            }
        }

        // 2. Delete user's rooms and images if owner
        const userRooms = await roomModel.find({ owner: user._id });
        const userRoomIds = userRooms.map((r) => r._id);

        for (const room of userRooms) {
            if (room.images && room.images.length > 0) {
                for (const img of room.images) {
                    if (img.fileId) {
                        try {
                            await deleteFile(img.fileId);
                        } catch (err) {
                            console.error("Delete Room Image Error:", err.message);
                        }
                    }
                }
            }
        }
        await roomModel.deleteMany({ owner: user._id });

        // 3. Delete conversations and messages involving user or user's rooms
        const userConversations = await ConversationModel.find({
            $or: [
                { buyer: user._id },
                { owner: user._id },
                { room: { $in: userRoomIds } },
            ],
        });
        const conversationIds = userConversations.map((c) => c._id);

        // Delete all messages belonging to these conversations or sent/received by this user
        await MessageModel.deleteMany({
            $or: [
                { conversation: { $in: conversationIds } },
                { sender: user._id },
                { receiver: user._id },
            ],
        });

        // Delete the conversations
        await ConversationModel.deleteMany({
            _id: { $in: conversationIds },
        });

        // 4. Delete push subscriptions
        await PushSubscriptionModel.deleteMany({ user: user._id });

        // 5. Delete notifications (received or sent)
        await NotificationModel.deleteMany({
            $or: [{ user: user._id }, { sender: user._id }],
        });

        // 6. Delete User Document
        await UserModel.findByIdAndDelete(user._id);

        // Send "Account Deleted" Confirmation Email
        try {
            await sendAccountDeletedConfirmationEmail({
                email: user.email,
                username: user.username,
            });
        } catch (emailErr) {
            console.error("Account Deleted Email Error:", emailErr);
        }

        // 7. Clean up Redis OTP keys
        await redis.del(otpKey);
        await redis.del(`delete-account-cooldown:${normalizedEmail}`);

        // 8. Clear Auth Cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.clearCookie("sessionId", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Your account and all associated data (rooms, chats, messages, notifications) have been permanently deleted.",
        });
    } catch (error) {
        console.error("Verify & Delete Account Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete account. Please try again.",
        });
    }
}

export default {
    getMyProfileController,
    updateProfileController,
    updateAvatarController,
    changePasswordController,
    sendDeleteAccountOtpController,
    verifyAndDeleteAccountController,
};
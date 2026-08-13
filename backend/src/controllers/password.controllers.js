import UserModel from "../models/user.model.js";
import { sendPasswordResetOtpEmail } from "../services/email.service.js";
import redis from "../services/redis.service.js";
import crypto from "crypto";


// ==========================================
// FORGOT PASSWORD
// ==========================================

export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body || {};

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await UserModel.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Redis keys
        const otpKey = `password-reset:${normalizedEmail}`;
        const cooldownKey =
            `password-reset-cooldown:${normalizedEmail}`;

        // Check cooldown first
        const cooldownExists = await redis.exists(cooldownKey);

        if (cooldownExists) {
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting another OTP",
            });
        }

        // Generate OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Store OTP for 40 seconds
        await redis.set(
            otpKey,
            otp,
            {
                ex: 40,
            }
        );

        // Send OTP email
        await sendPasswordResetOtpEmail({
            email: user.email,
            username: user.username,
            otp,
        });

        await redis.set(
            cooldownKey,
            "1",
            {
                ex: 60,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully",
        });

    } catch (error) {

        console.error("Forgot Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
// ==========================================
// VERIFY RESET OTP
// ==========================================

async function verifyResetOtpController(req, res) {
    try {
        const { email, otp } = req.body || {};

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedOtp = otp.toString().trim();

        const user = await UserModel.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        const otpKey = `password-reset:${normalizedEmail}`;

        const storedOtp = await redis.get(otpKey);

        if (!storedOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP",
            });
        }

        if (String(storedOtp).trim() !== normalizedOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
        // OTP is correct → consume OTP
        await redis.del(otpKey);

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Redis key for reset token
        const resetTokenKey =
            `password-reset-token:${normalizedEmail}`;

        // Reset token valid for 10 minutes
        await redis.set(
            resetTokenKey,
            resetToken,
            {
                ex: 10 * 60,
            }
        );

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken,
        });

    } catch (error) {
        console.error("Verify Reset OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ==========================================
// RESET PASSWORD
// ==========================================

async function resetPasswordController(req, res) {
    try {
        const {
            email,
            resetToken,
            newPassword,
            confirmPassword,
        } = req.body || {};

        // 1. Required fields
        if (
            !email ||
            !resetToken ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, reset token, new password and confirm password are required",
            });
        }

        // 2. Normalize
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Check password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        // 4. Password length
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }

        // 5. Find user
        const user = await UserModel.findOne({
            email: normalizedEmail,
        }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // 6. Redis reset token key
        const resetTokenKey =
            `password-reset-token:${normalizedEmail}`;

        // 7. Get stored reset token
        const storedResetToken =
            await redis.get(resetTokenKey);

        if (!storedResetToken) {
            return res.status(401).json({
                success: false,
                message:
                    "Reset token expired or invalid. Please verify OTP again",
            });
        }

        // 8. Verify reset token
        if (storedResetToken !== resetToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid reset token",
            });
        }

        // 9. Update password
        user.password = newPassword;

        await user.save();

        // 10. Delete reset token after successful password reset
        await redis.del(resetTokenKey);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error("Reset Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export default {
    forgotPasswordController,
    verifyResetOtpController,
    resetPasswordController
};
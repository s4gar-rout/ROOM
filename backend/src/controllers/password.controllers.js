import UserModel from "../models/user.model.js";
import { sendPasswordResetOtpEmail } from "../services/email.service.js";


// ==========================================
// FORGOT PASSWORD
// ==========================================

async function forgotPasswordController(req, res) {
    try {
       
    const { email } = req.body || {};

        // 1. Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // 2. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Find user
        const user = await UserModel.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // 4. Check OTP cooldown
        if (
            user.otpCooldownExpiresAt &&
            user.otpCooldownExpiresAt > new Date()
        ) {
            const remainingSeconds = Math.ceil(
                (user.otpCooldownExpiresAt.getTime() - Date.now()) / 1000
            );

            return res.status(429).json({
                success: false,
                message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
            });
        }

        // 5. Generate 6-digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // 6. OTP expiry - 10 minutes
        const otpExpiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // 7. OTP cooldown - 60 seconds
        const otpCooldownExpiresAt = new Date(
            Date.now() + 60 * 1000
        );

        // 8. Save OTP
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        user.otpCooldownExpiresAt = otpCooldownExpiresAt;

        await user.save();

        // 9. Send OTP email
        await sendPasswordResetOtpEmail({
            email: user.email,
            username: user.username,
            otp,
        });

        // 10. Response
        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully",
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send password reset OTP",
        });
    }
}

// ==========================================
// VERIFY RESET OTP
// ==========================================

async function verifyResetOtpController(req, res) {
    try {
        const { email, otp } = req.body || {};

        // 1. Required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // 2. Normalize
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedOtp = otp.toString().trim();

        // 3. Find user
        const user = await UserModel.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // 4. Check OTP exists
        if (!user.otp || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "No password reset OTP found",
            });
        }

        // 5. Check OTP expiry
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP",
            });
        }

        // 6. Check OTP
        if (user.otp !== normalizedOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // 7. OTP verified
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
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
            otp,
            newPassword,
            confirmPassword,
        } = req.body || {};

        // 1. Required fields
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, OTP, new password and confirm password are required",
            });
        }

        // 2. Normalize
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedOtp = otp.toString().trim();

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

        // 6. Check OTP exists
        if (!user.otp || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "No password reset OTP found",
            });
        }

        // 7. Check OTP expiry
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP",
            });
        }

        // 8. Verify OTP
        if (user.otp !== normalizedOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // 9. Update password
        user.password = newPassword;

        // 10. Clear OTP data
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.otpCooldownExpiresAt = undefined;

        await user.save();

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
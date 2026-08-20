import UserModel from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import redis from "../services/redis.service.js";
import crypto from "crypto";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/email.service.js";

// Register controller
async function registerController(req, res) {
    try {
        const { email, username, password, contact } = req.body;
        // 1. Required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required"
            });
        }

        // 2. Normalize
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();
        const normalizedContact = contact && contact.trim() ? contact.trim() : undefined;

        // 3. Check existing username
        const existingUsername = await UserModel.findOne({
            username: normalizedUsername
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // 4. Check existing email
        const existingEmail = await UserModel.findOne({
            email: normalizedEmail
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // 5. Check existing mobile/contact number
        if (normalizedContact) {
            const existingContact = await UserModel.findOne({
                contact: normalizedContact
            });

            if (existingContact) {
                return res.status(409).json({
                    success: false,
                    message: "This mobile number is already registered."
                });
            }
        }

        // 6. Generate 6-digit verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 7. Create user (email unverified by default)
        const user = await UserModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            contact: normalizedContact,
            isEmailVerified: false,
            emailVerificationOtp: otp,
            emailVerificationOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            role: "tenant",
            authProvider: "local"
        });

        // 8. Send Verification Email
        try {
            await sendVerificationEmail({
                email: normalizedEmail,
                username: normalizedUsername,
                otp,
            });
        } catch (emailErr) {
            console.error("Verification Email Error:", emailErr);
        }

        return res.status(201).json({
            success: true,
            requiresVerification: true,
            email: normalizedEmail,
            message: "Registration successful. A verification OTP has been sent to your email.",
        });

    } catch (error) {
        console.error("Register error:", error);

        if (error.code === 11000) {
            if (error.keyPattern?.contact || (typeof error.message === "string" && error.message.includes("contact"))) {
                return res.status(409).json({
                    success: false,
                    message: "This mobile number is already registered."
                });
            }
            if (error.keyPattern?.email || (typeof error.message === "string" && error.message.includes("email"))) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists"
                });
            }
            if (error.keyPattern?.username || (typeof error.message === "string" && error.message.includes("username"))) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists"
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Verify Email & Activate Account Controller
async function verifyEmailController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification OTP are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found",
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "Account is already verified and active",
            });
        }

        if (
            !user.emailVerificationOtp ||
            user.emailVerificationOtp !== otp.trim() ||
            !user.emailVerificationOtpExpiresAt ||
            user.emailVerificationOtpExpiresAt < new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification OTP",
            });
        }

        // Activate Account
        user.isEmailVerified = true;
        user.emailVerificationOtp = undefined;
        user.emailVerificationOtpExpiresAt = undefined;
        await user.save();

        // Send Welcome / Account Created Email
        try {
            await sendWelcomeEmail({
                email: user.email,
                username: user.username,
            });
        } catch (welcomeErr) {
            console.error("Welcome Email Error:", welcomeErr);
        }

        // Generate Tokens & Session
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const sessionId = crypto.randomUUID();

        await redis.set(`session:${sessionId}`, refreshToken, { ex: 7 * 24 * 60 * 60 });

        return res.status(200).json({
            success: true,
            message: "Account activated successfully!",
            sessionId,
            accessToken,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                avatar: user.avatar,
                authProvider: user.authProvider,
            },
        });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Login controller (Supports Email + Password OR Phone + Password)
async function loginController(req, res) {
    try {
        const { email, identifier, password } = req.body;
        const loginInput = (email || identifier || "").trim();

        if (!loginInput || !password) {
            return res.status(400).json({
                success: false,
                message: "Email or phone number and password are required",
            });
        }

        const normalizedInput = loginInput.toLowerCase();
        const cleanDigits = loginInput.replace(/\D/g, "");
        const phoneQuery = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : loginInput;

        // Query by Email, Phone (contact), or Username
        const user = await UserModel.findOne({
            $or: [
                { email: normalizedInput },
                { contact: loginInput },
                { contact: phoneQuery },
                { username: normalizedInput }
            ]
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email/phone or password",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email/phone or password",
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const sessionId = crypto.randomUUID();

        await redis.set(`session:${sessionId}`, refreshToken, { ex: 7 * 24 * 60 * 60 });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            sessionId,
            accessToken,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                avatar: user.avatar,
                authProvider: user.authProvider,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}



// Getme Controller
async function getMeController(req, res) {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                contact: req.user.contact,
                role: req.user.role,
                avatar: req.user.avatar
            }
        });

    } catch (error) {
        console.error("Get Me Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Refresh token controller
async function refreshTokenController(req, res) {
    try {
        // 1. Get sessionId
        const sessionId = req.headers["x-session-id"] || req.body?.sessionId;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                message: "Session ID not provided"
            });
        }

        const refreshToken = await redis.get(`session:${sessionId}`);

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Session expired or invalid"
            });
        }

        // 2. Check Redis blacklist
        const blacklistKey =
            `blacklist:refresh:${refreshToken}`;

        const isBlacklisted =
            await redis.get(blacklistKey);

        if (isBlacklisted) {
            await redis.del(`session:${sessionId}`);
            return res.status(401).json({
                success: false,
                message:
                    "Refresh token has been revoked. Please login again"
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(
            refreshToken,
            config.JWT_REFRESH_SECRET
        );

        // 4. Find user
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            await redis.del(`session:${sessionId}`);
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // 5. Generate new access token
        const newAccessToken =
            generateAccessToken(user);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken: newAccessToken
        });

    } catch (errors) {
        const sessionId = req.headers["x-session-id"] || req.body?.sessionId;
        if (sessionId) {
            await redis.del(`session:${sessionId}`);
        }

        if (errors.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message:
                    "Refresh token expired, please login again"
            });
        }

        if (errors.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        console.error(
            "Refresh Token Error:",
            errors
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//Logout Controller
async function logoutController(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const sessionId = req.headers["x-session-id"] || req.body?.sessionId;

        let refreshToken = null;
        if (sessionId) {
            refreshToken = await redis.get(`session:${sessionId}`);
        }

        // ==========================================
        // BLACKLIST ACCESS TOKEN
        // ==========================================

        if (accessToken) {
            try {
                const decodedAccessToken = jwt.verify(
                    accessToken,
                    config.JWT_ACCESS_SECRET
                );

                const currentTime = Math.floor(Date.now() / 1000);

                const remainingTime =
                    decodedAccessToken.exp - currentTime;

                if (remainingTime > 0) {

                    const accessBlacklistKey =
                        `blacklist:access:${accessToken}`;

                    await redis.set(
                        accessBlacklistKey,
                        "revoked",
                        {
                            ex: remainingTime,
                        }
                    );
                }

            } catch (error) {
                // Access token already expired/invalid
            }
        }


        // ==========================================
        // BLACKLIST REFRESH TOKEN
        // ==========================================

        if (refreshToken) {
            try {
                const decodedRefreshToken = jwt.verify(
                    refreshToken,
                    config.JWT_REFRESH_SECRET
                );

                const currentTime = Math.floor(Date.now() / 1000);

                const remainingTime =
                    decodedRefreshToken.exp - currentTime;

                if (remainingTime > 0) {

                    const refreshBlacklistKey =
                        `blacklist:refresh:${refreshToken}`;

                    await redis.set(
                        refreshBlacklistKey,
                        "revoked",
                        {
                            ex: remainingTime,
                        }
                    );
                }

            } catch (error) {
                // Refresh token already expired/invalid
            }
        }


        // ==========================================
        // CLEAR SESSION
        // ==========================================

        if (sessionId) {
            await redis.del(`session:${sessionId}`);
        }

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {

        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Become Owner Controller
async function becomeOwnerController(req, res) {
    try {
        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "owner") {
            return res.status(200).json({
                success: true,
                message: "You are already an owner",
                user: {
                    id: user._id,
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    contact: user.contact,
                    role: user.role,
                    avatar: user.avatar,
                    authProvider: user.authProvider
                }
            });
        }

        if (user.role !== "tenant") {
            return res.status(400).json({
                success: false,
                message: "Only tenant accounts can be converted to owner"
            });
        }

        user.role = "owner";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Account successfully updated to owner",
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                avatar: user.avatar,
                authProvider: user.authProvider
            }
        });
    } catch (error) {
        console.error("Become owner error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Resend Verification OTP Controller
async function resendVerificationOtpController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required to resend verification OTP",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found",
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "This account is already verified. Please sign in.",
            });
        }

        // Cooldown: ensure at least 60 seconds elapsed since last OTP was issued
        if (
            user.emailVerificationOtpExpiresAt &&
            user.emailVerificationOtpExpiresAt.getTime() - Date.now() > 14 * 60 * 1000
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting another verification code.",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationOtp = otp;
        user.emailVerificationOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendVerificationEmail({
                email: normalizedEmail,
                username: user.username,
                otp,
            });
        } catch (emailErr) {
            console.error("Resend Verification Email Error:", emailErr);
        }

        return res.status(200).json({
            success: true,
            message: "A new verification code has been sent to your email.",
        });

    } catch (error) {
        console.error("Resend verification OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export default {
    registerController,
    verifyEmailController,
    resendVerificationOtpController,
    loginController,
    getMeController,
    refreshTokenController,
    logoutController,
    becomeOwnerController,
};
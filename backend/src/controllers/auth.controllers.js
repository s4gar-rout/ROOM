import UserModel from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { config } from "../config/config.js";

// Register controller
async function registerController(req, res) {
    try {
        const { email, username, password, contact } = req.body
        // 1. Required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required"
            })
        }

        // 2. Normalize
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();


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

        // 5. Create user
        const user = await UserModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            contact: contact || "",
            role: "tenant",
            authProvider: "local"
        })

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);



        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        // 6. Response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                authProvider: user.authProvider
            }
        });


    } catch (error) {
        console.log("Register error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}


// Login controller
async function loginController(req, res) {

    try {

        const { email, password } = req.body;

        // 1. Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }


        // 2. Normalize
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Find user
        const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 5. Check blocked user
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }


        // 6. Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 7. Response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                contact: user.contact,
                role: user.role,
                authProvider: user.authProvider
            }
        });


    } catch (error) {
        console.log("Login error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Getme Controller
async function getMeController(req, res) {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                contact: req.user.contact,
                role: req.user.role,
                ownerVerified: req.user.ownerVerified
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

export default {
    registerController,
    loginController,
    getMeController
}
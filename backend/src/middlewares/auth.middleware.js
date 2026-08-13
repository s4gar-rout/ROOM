import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { config } from "../config/config.js";

export const authMiddleware = async (req, res, next) => {
    try {
        // 1. Get access token from cookie
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token not provided",
            });
        }

        // 2. Verify access token
        const decoded = jwt.verify(
            token,
            config.JWT_ACCESS_SECRET
        );

        // 3. Find user
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // 4. Check blocked user
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked",
            });
        }

        // 5. Attach authenticated user
        req.user = user;

        // 6. Continue
        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid access token",
            });
        }

        console.error("Auth Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export default authMiddleware;
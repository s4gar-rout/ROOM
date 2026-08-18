import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { config } from "../config/config.js";
import redis from "../services/redis.service.js";

/**
 * Optional Auth Middleware
 * Extracts the user token if available and sets req.user,
 * but allows the request to proceed if unauthenticated.
 */
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(
            token,
            config.JWT_ACCESS_SECRET
        );
        
        const blacklistKey = `blacklist:access:${token}`;
        const isBlacklisted = await redis.get(blacklistKey);

        if (isBlacklisted) {
            return next();
        }

        const user = await UserModel.findById(decoded.id);

        if (!user || user.isBlocked) {
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        // If there's an error (e.g. invalid token), just ignore it and proceed as unauthenticated
        next();
    }
};

export default optionalAuthMiddleware;

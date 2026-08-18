import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { config } from "../config/config.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        // Get access token from cookie or auth object
        let token = socket.handshake.auth?.token;
        
        if (!token && socket.handshake.headers.cookie) {
            const cookies = socket.handshake.headers.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'accessToken') {
                    token = value;
                    break;
                }
            }
        }

        if (!token) {
            return next(new Error("Access token not provided"));
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            config.JWT_ACCESS_SECRET
        );

        // Find user
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return next(new Error("User not found"));
        }

        // Check blocked user
        if (user.isBlocked) {
            return next(
                new Error("Your account has been blocked")
            );
        }

        // Attach user to socket
        socket.user = user;

        next();

    } catch (error) {

        if (error.name !== "TokenExpiredError") {
            console.error("Socket Auth Error:", error.message);
        }

        if (error.name === "TokenExpiredError") {
            return next(new Error("Access token expired"));
        }

        if (error.name === "JsonWebTokenError") {
            return next(new Error("Invalid access token"));
        }

        return next(
            new Error("Socket authentication failed")
        );
    }
};

export default socketAuthMiddleware;
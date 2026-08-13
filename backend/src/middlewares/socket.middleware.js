import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { config } from "../config/config.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        // Check cookie header
        if (!cookieHeader) {
            return next(new Error("Access token not provided"));
        }

        // Parse cookies manually
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((cookie) => {
                const [key, ...value] = cookie.split("=");

                return [key, value.join("=")];
            })
        );

        // Get access token
        const token = cookies.accessToken;

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

        console.error("Socket Auth Error:", error);

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
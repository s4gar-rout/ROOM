import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { config } from "../config/config.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        console.log("Cookie Header:", cookieHeader);

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

        console.log("Cookies:", Object.keys(cookies));

        const token = cookies.accessToken;

        if (!token) {
            return next(new Error("Access token not provided"));
        }

        const decoded = jwt.verify(
            token,
            config.JWT_ACCESS_SECRET
        );

        console.log("Decoded user:", decoded.id);

        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return next(new Error("User not found"));
        }

        if (user.isBlocked) {
            return next(new Error("Your account has been blocked"));
        }

        socket.user = user;

        next();

    } catch (error) {

        console.error("========== SOCKET AUTH ERROR ==========");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("=======================================");

        if (error.name === "TokenExpiredError") {
            return next(new Error("Access token expired"));
        }

        if (error.name === "JsonWebTokenError") {
            return next(new Error("Invalid access token"));
        }

        return next(new Error("Socket authentication failed"));
    }
};

export default socketAuthMiddleware;
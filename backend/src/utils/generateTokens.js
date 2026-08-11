import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        config.JWT_ACCESS_SECRET,
        {
            expiresIn: config.ACCESS_TOKEN_EXPIRES_IN || "15m"
        }
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id
        },
        config.JWT_REFRESH_SECRET,
        {
            expiresIn: config.REFRESH_TOKEN_EXPIRES_IN || "7d"
        }
    );
};
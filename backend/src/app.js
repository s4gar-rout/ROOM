import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { config } from "./config/config.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import roomRoutes from "./routes/room.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import notificationRoutes from "./routes/rotification.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// ==========================================
// CORS
// ==========================================
export const allowedOrigins = [
  "https://livansa.in",
  "https://www.livansa.in",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  config.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (config.NODE_ENV !== "production" &&
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(null, false);
    },
    credentials: true,
  })
);

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Livansa API is running",
  });
});

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/feedback", feedbackRoutes);

// ==========================================
// 404 NOT FOUND HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested API route could not be found",
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use(errorHandler);

export default app;
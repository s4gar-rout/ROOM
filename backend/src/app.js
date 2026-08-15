import express from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser";
import morgan from 'morgan'
import { config } from './config/config.js';
const app = express()


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'))
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "RoomSetu API is running",
    });
});


// Import routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import roomRoutes from "./routes/room.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import notificationRoutes from "./routes/rotification.routes.js";


// Use routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/conversations', conversationRoutes)
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);

export default app
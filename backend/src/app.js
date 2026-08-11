import express from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser";
import morgan from 'morgan'
const app = express()


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'))
// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ['GET', 'PUT', 'POST', 'DELETE'],
//     credentials: true
// }))


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "RoomSetu API is running",
    });
});


// Import routes
import authRoutes from "./routes/auth.routes.js";



// Use routes
app.use('/api/auth',authRoutes)


export default app
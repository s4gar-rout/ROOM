import dns from 'dns'
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { config } from "./config/config.js";
import connectToDB from "./config/db.js";

import { initializeSocket } from "./sockets/socket.js";
import socketAuthMiddleware from "./middlewares/socket.middleware.js";
import { testRedisConnection } from "./services/redis.service.js";

connectToDB().catch((err) => console.error("Database connection startup warning:", err?.message));
testRedisConnection().catch((err) => console.error("Redis connection startup warning:", err?.message));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: config.FRONTEND_URL,
        credentials: true,
    },
});

app.set("io", io);

io.use(socketAuthMiddleware);
initializeSocket(io);

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});

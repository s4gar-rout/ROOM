import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { config } from "./config/config.js";
import connectToDB from "./config/db.js";

import { initializeSocket } from "./sockets/socket.js";
import socketAuthMiddleware from "./middlewares/socket.middleware.js";
import { testRedisConnection } from "./services/redis.service.js";

connectToDB();
await testRedisConnection();

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

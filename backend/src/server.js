import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { config } from "./config/config.js";
import connectToDB from "./config/db.js";

import { initializeSocket } from "./sockets/socket.js";
import socketAuthMiddleware from "./middlewares/socket.middleware.js";

connectToDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Socket authentication
io.use(socketAuthMiddleware);

// Socket events
initializeSocket(io);

server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});
import mongoose from "mongoose";
import ConversationModel from "../models/conversation.model.js";
import {
    sendMessage,
    markConversationAsRead,
    isParticipant,
    getConversationRoomId,
} from "../services/conversation.service.js";

const onlineUsers = new Map();

export function isUserOnline(userId) {
    const sockets = onlineUsers.get(userId.toString());
    return Boolean(sockets && sockets.size > 0);
}

export function initializeSocket(io) {
    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socket.id);

        if (onlineUsers.get(userId).size === 1) {
            io.emit("user:online", { userId });
        }

        socket.join(`user:${userId}`);

        socket.on("conversation:join", async (conversationId) => {
            try {
                if (
                    !conversationId ||
                    !mongoose.Types.ObjectId.isValid(
                        conversationId
                    )
                ) {
                    return socket.emit("conversation:error", {
                        message: "Invalid conversation ID",
                    });
                }

                const conversation =
                    await ConversationModel.findById(
                        conversationId
                    );

                if (!conversation) {
                    return socket.emit("conversation:error", {
                        message: "Conversation not found",
                    });
                }

                if (!isParticipant(conversation, userId)) {
                    return socket.emit("conversation:error", {
                        message:
                            "You are not allowed to join this conversation",
                    });
                }

                const roomId =
                    getConversationRoomId(conversationId);

                socket.join(roomId);

                socket.emit("conversation:joined", {
                    conversationId,
                });
            } catch (error) {
                console.error(
                    "Join Conversation Error:",
                    error
                );

                socket.emit("conversation:error", {
                    message:
                        "Failed to join conversation",
                });
            }
        });

        socket.on(
            "conversation:leave",
            (conversationId) => {
                if (
                    !conversationId ||
                    !mongoose.Types.ObjectId.isValid(
                        conversationId
                    )
                ) {
                    return;
                }

                socket.leave(
                    getConversationRoomId(conversationId)
                );
            }
        );

        socket.on(
            "typing:start",
            async (conversationId) => {
                try {
                    if (
                        !conversationId ||
                        !mongoose.Types.ObjectId.isValid(
                            conversationId
                        )
                    ) {
                        return;
                    }

                    const conversation =
                        await ConversationModel.findById(
                            conversationId
                        );

                    if (
                        !conversation ||
                        !isParticipant(
                            conversation,
                            userId
                        )
                    ) {
                        return;
                    }

                    socket
                        .to(
                            getConversationRoomId(
                                conversationId
                            )
                        )
                        .emit("typing:start", {
                            userId,
                            username:
                                socket.user.username,
                            conversationId,
                        });
                } catch (error) {
                    console.error(
                        "Typing Start Error:",
                        error
                    );
                }
            }
        );

        socket.on(
            "typing:stop",
            async (conversationId) => {
                try {
                    if (
                        !conversationId ||
                        !mongoose.Types.ObjectId.isValid(
                            conversationId
                        )
                    ) {
                        return;
                    }

                    const conversation =
                        await ConversationModel.findById(
                            conversationId
                        );

                    if (
                        !conversation ||
                        !isParticipant(
                            conversation,
                            userId
                        )
                    ) {
                        return;
                    }

                    socket
                        .to(
                            getConversationRoomId(
                                conversationId
                            )
                        )
                        .emit("typing:stop", {
                            userId,
                            conversationId,
                        });
                } catch (error) {
                    console.error(
                        "Typing Stop Error:",
                        error
                    );
                }
            }
        );

        socket.on("message:send", async (data = {}) => {
            try {
                const { conversationId, message } =
                    data;

                const newMessage = await sendMessage({
                    conversationId,
                    senderId: socket.user._id,
                    text: message,
                    io,
                });

                // The message:new event is already broadcast by
                // sendMessage(). This event is only an acknowledgement
                // to the sending socket.
                socket.emit("message:sent", {
                    success: true,
                    message: newMessage,
                });
            } catch (error) {
                console.error(
                    "Socket Send Message Error:",
                    error
                );

                socket.emit("message:error", {
                    message:
                        error.message ||
                        "Failed to send message",
                });
            }
        });

        socket.on(
            "message:read",
            async (conversationId) => {
                try {
                    if (
                        !conversationId ||
                        !mongoose.Types.ObjectId.isValid(
                            conversationId
                        )
                    ) {
                        return;
                    }

                    await markConversationAsRead(
                        conversationId,
                        socket.user._id,
                        io
                    );
                } catch (error) {
                    console.error(
                        "Socket Mark Read Error:",
                        error
                    );
                }
            }
        );

        socket.on("disconnect", () => {
            const userSockets =
                onlineUsers.get(userId);

            if (!userSockets) return;

            userSockets.delete(socket.id);

            if (userSockets.size === 0) {
                onlineUsers.delete(userId);
                io.emit("user:offline", { userId });
            }
        });
    });
}

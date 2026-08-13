import MessageModel from "../models/message.model.js";
import ConversationModel from "../models/conversation.model.js";

// ==========================================
// ONLINE USERS TRACKING
// ==========================================

// userId => Set of socketIds
// Multiple tabs/devices support karega
const onlineUsers = new Map();

export function initializeSocket(io) {
    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();

        // ==========================================
        // ONLINE USER TRACKING
        // ==========================================

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socket.id);

        // User actually online hua
        // Sirf first socket connect hone par emit hoga
        if (onlineUsers.get(userId).size === 1) {
            io.emit("userOnline", {
                userId,
            });
        }


        // ==========================================
        // PERSONAL USER ROOM
        // ==========================================

        // Har user apne personal room mein join hoga.
        // Notifications isi room mein bhejenge.
        socket.join(`user:${userId}`);


        // ==========================================
        // JOIN CONVERSATION
        // ==========================================

        socket.on("joinConversation", async (conversationId) => {
            try {
                const conversation =
                    await ConversationModel.findById(conversationId);

                if (!conversation) {
                    return socket.emit("conversationError", {
                        success: false,
                        message: "Conversation not found",
                    });
                }

                const isBuyer =
                    conversation.buyer.toString() === userId;

                const isOwner =
                    conversation.owner.toString() === userId;

                // User conversation ka part nahi hai
                if (!isBuyer && !isOwner) {
                    return socket.emit("conversationError", {
                        success: false,
                        message:
                            "You are not allowed to join this conversation",
                    });
                }

                socket.join(conversationId);

                socket.emit("conversationJoined", {
                    success: true,
                    conversationId,
                });

            } catch (error) {
                console.error(
                    "Join Conversation Error:",
                    error
                );

                socket.emit("conversationError", {
                    success: false,
                    message: "Failed to join conversation",
                });
            }
        });


        // ==========================================
        // TYPING INDICATOR
        // ==========================================

        socket.on("typingStart", async (conversationId) => {
            try {
                if (!conversationId) return;

                const conversation =
                    await ConversationModel.findById(conversationId);

                if (!conversation) return;

                const isBuyer =
                    conversation.buyer.toString() === userId;

                const isOwner =
                    conversation.owner.toString() === userId;

                if (!isBuyer && !isOwner) return;

                socket.to(conversationId).emit("userTyping", {
                    userId,
                    username: socket.user.username,
                });

            } catch (error) {
                console.error("Typing Start Error:", error);
            }
        });


        socket.on("typingStop", async (conversationId) => {
            try {
                if (!conversationId) return;

                const conversation =
                    await ConversationModel.findById(conversationId);

                if (!conversation) return;

                const isBuyer =
                    conversation.buyer.toString() === userId;

                const isOwner =
                    conversation.owner.toString() === userId;

                if (!isBuyer && !isOwner) return;

                socket.to(conversationId).emit("userStoppedTyping", {
                    userId,
                });

            } catch (error) {
                console.error("Typing Stop Error:", error);
            }
        });


        // ==========================================
        // SEND MESSAGE
        // ==========================================

        socket.on("sendMessage", async (data) => {
            try {
                const {
                    conversationId,
                    message,
                } = data;

                // Message validation
                if (
                    !conversationId ||
                    !message?.trim() ||
                    message.trim().length > 1000
                ) {
                    return socket.emit("messageError", {
                        success: false,
                        message:
                            "Message is required and must not exceed 1000 characters",
                    });
                }


                // Find conversation
                const conversation =
                    await ConversationModel.findById(conversationId);

                if (!conversation) {
                    return socket.emit("messageError", {
                        success: false,
                        message: "Conversation not found",
                    });
                }


                // Check user access
                const isBuyer =
                    conversation.buyer.toString() === userId;

                const isOwner =
                    conversation.owner.toString() === userId;

                if (!isBuyer && !isOwner) {
                    return socket.emit("messageError", {
                        success: false,
                        message:
                            "You are not allowed to send messages in this conversation",
                    });
                }


                // ==========================================
                // SAVE MESSAGE
                // ==========================================

                const newMessage =
                    await MessageModel.create({
                        conversation: conversationId,
                        sender: socket.user._id,
                        message: message.trim(),
                    });


                // Populate sender information
                await newMessage.populate(
                    "sender",
                    "username email"
                );


                // ==========================================
                // SEND MESSAGE TO RECEIVER
                // ==========================================

                socket
                    .to(conversationId)
                    .emit("receiveMessage", {
                        _id: newMessage._id,
                        conversation: newMessage.conversation,
                        sender: newMessage.sender,
                        message: newMessage.message,
                        createdAt: newMessage.createdAt,
                    });


                // ==========================================
                // SEND CONFIRMATION TO SENDER
                // ==========================================

                socket.emit("messageSent", {
                    success: true,
                    message: {
                        _id: newMessage._id,
                        conversation: newMessage.conversation,
                        sender: newMessage.sender,
                        message: newMessage.message,
                        createdAt: newMessage.createdAt,
                    },
                });

            } catch (error) {
                console.error(
                    "Socket Send Message Error:",
                    error
                );

                socket.emit("messageError", {
                    success: false,
                    message: "Failed to send message",
                });
            }
        });


        // ==========================================
        // DISCONNECT
        // ==========================================

        socket.on("disconnect", (reason) => {
            const userSockets = onlineUsers.get(userId);

            if (!userSockets) {
                return;
            }

            // Current socket remove
            userSockets.delete(socket.id);

            // Agar user ka koi aur socket connected nahi hai
            if (userSockets.size === 0) {
                onlineUsers.delete(userId);

                io.emit("userOffline", {
                    userId,
                });
            }
        });

    });
}
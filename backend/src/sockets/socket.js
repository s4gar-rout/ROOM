import MessageModel from "../models/message.model.js";
import ConversationModel from "../models/conversation.model.js";

export function initializeSocket(io) {

    io.on("connection", (socket) => {

        console.log(
            "User connected:",
            socket.id,
            "User:",
            socket.user._id.toString()
        );


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

                const userId = socket.user._id.toString();

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

                console.log(
                    `User ${userId} joined conversation ${conversationId}`
                );

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
        // SEND MESSAGE
        // ==========================================

        socket.on("sendMessage", async (data) => {

            try {

                const {
                    conversationId,
                    message
                } = data;

                if (!conversationId || !message?.trim()) {
                    return socket.emit("messageError", {
                        success: false,
                        message:
                            "Conversation ID and message are required",
                    });
                }

                const conversation =
                    await ConversationModel.findById(conversationId);

                if (!conversation) {
                    return socket.emit("messageError", {
                        success: false,
                        message: "Conversation not found",
                    });
                }

                const userId = socket.user._id.toString();

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

                // Save message
                const newMessage =
                    await MessageModel.create({
                        conversation: conversationId,

                        // Sender server khud identify karega
                        sender: socket.user._id,

                        message: message.trim(),
                    });

                // Receiver ko message
                socket.to(conversationId).emit("receiveMessage", {
                    _id: newMessage._id,
                    conversation: newMessage.conversation,
                    sender: newMessage.sender,
                    message: newMessage.message,
                    createdAt: newMessage.createdAt,
                });

                // Sender ko confirmation
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

            console.log(
                "User disconnected:",
                socket.id,
                reason
            );

        });

    });
}
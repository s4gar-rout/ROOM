import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import { createNotification } from "./notification.service.js";

const USER_SELECT = "username email avatar";

export function getConversationRoomId(conversationId) {
    return `conversation:${conversationId}`;
}

export function getParticipantId(participant) {
    if (!participant) return null;
    return participant._id ? participant._id.toString() : participant.toString();
}

export function isParticipant(conversation, userId) {
    if (!conversation || !userId) return false;

    const id = userId.toString();
    const buyerId = getParticipantId(conversation.buyer);
    const ownerId = getParticipantId(conversation.owner);

    return (
        buyerId === id ||
        ownerId === id
    );
}

export function getOtherParticipant(conversation, userId) {
    if (!conversation || !userId) return null;

    const id = userId.toString();
    const buyerId = getParticipantId(conversation.buyer);
    const ownerId = getParticipantId(conversation.owner);

    if (buyerId === id) {
        return conversation.owner;
    }

    if (ownerId === id) {
        return conversation.buyer;
    }

    return null;
}

export function getUnreadCountForUser(conversation, userId) {
    if (!conversation || !userId) return 0;

    const id = userId.toString();
    const buyerId = getParticipantId(conversation.buyer);
    const ownerId = getParticipantId(conversation.owner);

    if (ownerId === id) {
        return conversation.unreadCountForOwner || 0;
    }

    if (buyerId === id) {
        return conversation.unreadCountForTenant || 0;
    }

    return 0;
}

function chatError(message, status) {
    return Object.assign(new Error(message), { status });
}

export async function sendMessage({
    conversationId,
    senderId,
    text,
    io,
}) {
    const trimmed = typeof text === "string" ? text.trim() : "";

    if (!trimmed) {
        throw chatError("Message is required", 400);
    }

    if (trimmed.length > 1000) {
        throw chatError("Message cannot exceed 1000 characters", 400);
    }

    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
        throw chatError("Conversation not found", 404);
    }

    if (!isParticipant(conversation, senderId)) {
        throw chatError(
            "You are not allowed to send messages in this conversation",
            403
        );
    }

    const receiverId = getOtherParticipant(conversation, senderId);

    if (!receiverId) {
        throw chatError("Conversation participant not found", 400);
    }

    const newMessage = await MessageModel.create({
        conversation: conversationId,
        sender: senderId,
        receiver: receiverId,
        message: trimmed,
    });

    await newMessage.populate([
        { path: "sender", select: USER_SELECT },
        { path: "receiver", select: USER_SELECT },
    ]);

    const isOwnerSender =
        getParticipantId(conversation.owner) === senderId.toString();

    const increment = isOwnerSender
        ? { unreadCountForTenant: 1 }
        : { unreadCountForOwner: 1 };

    const updatedConversation =
        await ConversationModel.findByIdAndUpdate(
            conversationId,
            {
                $set: {
                    lastMessage: trimmed,
                    lastMessageAt: newMessage.createdAt,
                },
                $inc: increment,
            },
            { new: true }
        );

    if (!updatedConversation) {
        // Message was created but conversation disappeared unexpectedly.
        // Keep the database consistent by removing the orphan message.
        await MessageModel.deleteOne({ _id: newMessage._id });
        throw chatError("Conversation is no longer available", 404);
    }

    const populatedMessage = {
        _id: newMessage._id,
        conversation: newMessage.conversation,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
        message: newMessage.message,
        read: newMessage.read,
        readAt: newMessage.readAt,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
    };

    if (io) {
        const roomId = getConversationRoomId(conversationId);

        // Message event: clients in the conversation update the chat UI.
        io.to(roomId).emit("message:new", populatedMessage);

        // Sidebar/latest-message update.
        io.to(`user:${receiverId.toString()}`).emit(
            "conversation:updated",
            {
                conversationId,
                lastMessage: trimmed,
                lastMessageAt: newMessage.createdAt,
                unreadIncrement: 1,
            }
        );
    }

    // Persist ONE notification and let the notification service emit
    // notification:new. Do not emit the same event here as well.
    await createNotification({
        userId: receiverId,
        type: "NEW_MESSAGE",
        title: "New message",
        message: `${newMessage.sender.username}: ${trimmed.slice(0, 80)}`,
        conversation: conversationId,
        sender: senderId,
        room: conversation.room,
        messageId: newMessage._id,
        io,
    });

    return populatedMessage;
}

export async function markConversationAsRead(
    conversationId,
    userId,
    io
) {
    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
        throw chatError("Conversation not found", 404);
    }

    if (!isParticipant(conversation, userId)) {
        throw chatError(
            "You are not allowed to access this conversation",
            403
        );
    }

    const now = new Date();

    const readResult = await MessageModel.updateMany(
        {
            conversation: conversationId,
            receiver: userId,
            read: false,
        },
        {
            $set: {
                read: true,
                readAt: now,
            },
        }
    );

    const isOwner = getParticipantId(conversation.owner) === userId.toString();

    const unreadField = isOwner
        ? "unreadCountForOwner"
        : "unreadCountForTenant";

    await ConversationModel.findByIdAndUpdate(
        conversationId,
        {
            $set: {
                [unreadField]: 0,
            },
        }
    );

    if (io) {
        const roomId = getConversationRoomId(conversationId);

        io.to(roomId).emit("message:read:update", {
            conversationId,
            readBy: userId.toString(),
            readAt: now,
        });

        io.to(`user:${userId.toString()}`).emit(
            "conversation:read",
            {
                conversationId,
                unreadCount: 0,
            }
        );
    }

    return {
        success: true,
        markedCount: readResult.modifiedCount || 0,
    };
}

export async function getTotalUnreadCount(userId) {
    const [result] = await ConversationModel.aggregate([
        {
            $match: {
                $or: [
                    { buyer: userId },
                    { owner: userId },
                ],
            },
        },
        {
            $project: {
                unread: {
                    $cond: [
                        { $eq: ["$owner", userId] },
                        "$unreadCountForOwner",
                        "$unreadCountForTenant",
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$unread" },
            },
        },
    ]);

    return result?.total || 0;
}

export async function deleteMessage({
    conversationId,
    messageId,
    userId,
    io,
}) {
    const message = await MessageModel.findById(messageId);

    if (!message) {
        throw chatError("Message not found", 404);
    }

    if (message.conversation.toString() !== conversationId) {
        throw chatError("Message does not belong to this conversation", 400);
    }

    if (message.sender.toString() !== userId.toString()) {
        throw chatError("You can only delete your own messages", 403);
    }

    if (message.isDeleted) {
        throw chatError("Message is already deleted", 400);
    }

    message.isDeleted = true;
    await message.save();

    if (io) {
        const roomId = getConversationRoomId(conversationId);
        io.to(roomId).emit("message:deleted", {
            conversationId,
            messageId,
        });
    }

    return true;
}

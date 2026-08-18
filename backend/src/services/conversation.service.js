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
        isDeletedForEveryone: false,
        deletedFor: [],
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

/**
 * Delete a message ONLY for the requesting user.
 * The other participant continues to see the original message.
 * Emits "message:deleted:forme" only to the requesting user's private room.
 */
export async function deleteMessageForMe({
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

    // Verify the requesting user is a conversation participant.
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
        throw chatError("Conversation not found", 404);
    }
    if (!isParticipant(conversation, userId)) {
        throw chatError("You are not allowed to delete messages in this conversation", 403);
    }

    // If already deleted for everyone, nothing to do.
    if (message.isDeletedForEveryone || message.isDeleted) {
        throw chatError("Message is already deleted", 400);
    }

    const userIdStr = userId.toString();
    const alreadyDeleted = message.deletedFor.some(
        (id) => id.toString() === userIdStr
    );

    if (alreadyDeleted) {
        throw chatError("Message already deleted for you", 400);
    }

    // Add this user to the deletedFor array.
    await MessageModel.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: userId },
    });

    if (io) {
        // Only notify the requesting user's sockets — not the other participant.
        io.to(`user:${userIdStr}`).emit("message:deleted:forme", {
            conversationId,
            messageId,
        });
    }

    return true;
}

/**
 * Delete a message for EVERYONE in the conversation.
 * Only the original sender can do this.
 * Shows "This message was deleted" to both participants.
 * Emits "message:deleted:foreveryone" to the full conversation socket room.
 */
export async function deleteMessageForEveryone({
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

    // Only the original sender can delete for everyone.
    if (message.sender.toString() !== userId.toString()) {
        throw chatError("You can only delete your own messages for everyone", 403);
    }

    // Already globally deleted.
    if (message.isDeletedForEveryone || message.isDeleted) {
        throw chatError("Message is already deleted", 400);
    }

    await MessageModel.findByIdAndUpdate(messageId, {
        $set: { isDeletedForEveryone: true },
    });

    const conversation = await ConversationModel.findById(conversationId);
    let payloadLastMessage = undefined;
    let payloadLastMessageAt = undefined;

    if (conversation) {
        // Query the latest non-deleted message to ensure consistency
        const latestMessageInDb = await MessageModel.findOne({
            conversation: conversationId,
            isDeletedForEveryone: { $ne: true },
            isDeleted: { $ne: true },
        }).sort({ createdAt: -1 });

        const actualLastMessage = latestMessageInDb ? latestMessageInDb.message : "This message was deleted";
        const actualLastMessageAt = latestMessageInDb ? latestMessageInDb.createdAt : conversation.createdAt;

        if (conversation.lastMessage !== actualLastMessage) {
            payloadLastMessage = actualLastMessage;
            payloadLastMessageAt = actualLastMessageAt;

            await ConversationModel.findByIdAndUpdate(conversationId, {
                $set: {
                    lastMessage: payloadLastMessage,
                    lastMessageAt: payloadLastMessageAt,
                },
            });
        }
    }

    if (io) {
        const roomId = getConversationRoomId(conversationId);
        const payload = {
            conversationId,
            messageId,
            deletedFor: "everyone",
        };

        if (payloadLastMessage !== undefined) {
            payload.lastMessage = payloadLastMessage;
            payload.lastMessageAt = payloadLastMessageAt;
        }

        // Broadcast to ALL conversation participants.
        io.to(roomId).emit("message:deleted:foreveryone", payload);
        
        // Also emit to individual user channels so the sidebar updates if they aren't in the room
        if (conversation) {
            const ownerStr = getParticipantId(conversation.owner);
            const buyerStr = getParticipantId(conversation.buyer);
            if (ownerStr) io.to(`user:${ownerStr}`).emit("message:deleted:foreveryone", payload);
            if (buyerStr && buyerStr !== ownerStr) io.to(`user:${buyerStr}`).emit("message:deleted:foreveryone", payload);
        }
    }

    return true;
}

/**
 * Legacy deleteMessage — kept for backward compat.
 * Routes now call deleteMessageForMe or deleteMessageForEveryone directly.
 */
export async function deleteMessage({
    conversationId,
    messageId,
    userId,
    io,
}) {
    return deleteMessageForEveryone({ conversationId, messageId, userId, io });
}

/**
 * Clear the conversation for one user only.
 * Records the current timestamp so messages created before now
 * will no longer appear in that user's message list.
 * Emits "conversation:cleared" only to that user.
 */
export async function clearConversationForUser({
    conversationId,
    userId,
    io,
}) {
    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
        throw chatError("Conversation not found", 404);
    }

    if (!isParticipant(conversation, userId)) {
        throw chatError("You are not allowed to clear this conversation", 403);
    }

    const now = new Date();
    const userKey = userId.toString();

    if (!conversation.clearedAt) {
        conversation.clearedAt = new Map();
    }

    // By creating a completely new Map, we force Mongoose to overwrite the entire `clearedAt`
    // field instead of using delta updates ($set: { "clearedAt.userKey": ... })
    // This resolves the MongoDB error where it refuses to set a dot-notation field on an existing Array.
    const updatedClearedAt = new Map(conversation.clearedAt);
    updatedClearedAt.set(userKey, now);
    conversation.clearedAt = updatedClearedAt;
    
    await conversation.save();

    if (io) {
        io.to(`user:${userKey}`).emit("conversation:cleared", {
            conversationId,
            clearedAt: now,
        });
    }

    return { clearedAt: now };
}

/**
 * Build the message query for a specific user, respecting:
 * - isDeletedForEveryone / legacy isDeleted (show tombstone, not excluded)
 * - deletedFor (exclude entirely for that user)
 * - conversation.clearedAt[userId] (exclude messages before that timestamp)
 */
export async function getMessagesForUser({
    conversationId,
    userId,
    page = 1,
    limit = 30,
}) {
    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
        throw chatError("Conversation not found", 404);
    }

    if (!isParticipant(conversation, userId)) {
        throw chatError("You are not allowed to view this conversation", 403);
    }

    const userIdStr = userId.toString();
    const clearedAt = conversation.clearedAt?.get(userIdStr) || null;

    const skip = (page - 1) * limit;

    // Base filter: belongs to this conversation, not deleted for this user.
    const filter = {
        conversation: conversationId,
        deletedFor: { $ne: userId },
    };

    // If the user has cleared the conversation, only show messages after that timestamp.
    if (clearedAt) {
        filter.createdAt = { $gt: clearedAt };
    }

    const [messages, total] = await Promise.all([
        MessageModel.find(filter)
            .populate("sender", USER_SELECT)
            .populate("receiver", USER_SELECT)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        MessageModel.countDocuments(filter),
    ]);

    // Chronological order for the chat UI.
    messages.reverse();

    // Normalize legacy isDeleted → isDeletedForEveryone so the frontend
    // only needs to check one field.
    const normalized = messages.map((m) => ({
        ...m,
        isDeletedForEveryone: m.isDeletedForEveryone || m.isDeleted || false,
    }));

    return { messages: normalized, total, page, limit };
}

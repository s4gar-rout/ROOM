import mongoose from "mongoose";
import ConversationModel from "../models/conversation.model.js";
import roomModel from "../models/room.model.js";
import MessageModel from "../models/message.model.js";
import {
    sendMessage,
    markConversationAsRead,
    getTotalUnreadCount,
    isParticipant,
    getUnreadCountForUser,
    deleteMessage,
} from "../services/conversation.service.js";

const USER_SELECT = "username email avatar";
const ROOM_SELECT = "title images rent location availability";

function formatConversation(conversation, currentUserId) {
    const obj = conversation.toObject
        ? conversation.toObject()
        : conversation;

    const currentId = currentUserId.toString();

    const ownerId = obj.owner?._id
        ? obj.owner._id.toString()
        : obj.owner?.toString();

    const buyerId = obj.buyer?._id
        ? obj.buyer._id.toString()
        : obj.buyer?.toString();

    const isOwner = ownerId === currentId;
    const isBuyer = buyerId === currentId;

    if (!isOwner && !isBuyer) {
        return null;
    }

    const otherUser = isOwner ? obj.buyer : obj.owner;

    return {
        _id: obj._id,
        room: obj.room,
        owner: obj.owner,
        buyer: obj.buyer,
        otherUser,
        lastMessage: obj.lastMessage || "",
        lastMessageAt: obj.lastMessageAt,
        unreadCount: getUnreadCountForUser(obj, currentUserId),
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
    };
}

export async function createConversationController(req, res) {
    try {
        const { roomId } = req.params;
        const tenantId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID",
            });
        }

        const room = await roomModel.findById(roomId).select(
            "owner availability title images rent location"
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        if (!room.availability) {
            return res.status(400).json({
                success: false,
                message: "This room is currently unavailable",
            });
        }

        if (room.owner.toString() === tenantId.toString()) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot chat with yourself about your own room",
            });
        }

        if (
            req.user.role === "owner" &&
            room.owner.toString() !== tenantId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Owners cannot contact other owners.",
            });
        }

        let conversation = await ConversationModel.findOne({
            buyer: tenantId,
            owner: room.owner,
            room: room._id,
        });

        if (!conversation) {
            try {
                conversation = await ConversationModel.create({
                    buyer: tenantId,
                    owner: room.owner,
                    room: room._id,
                });
            } catch (error) {
                if (error.code !== 11000) throw error;

                conversation = await ConversationModel.findOne({
                    buyer: tenantId,
                    owner: room.owner,
                    room: room._id,
                });
            }
        }

        const populated = await ConversationModel.findById(
            conversation._id
        )
            .populate("buyer", USER_SELECT)
            .populate("owner", USER_SELECT)
            .populate("room", ROOM_SELECT);

        return res.status(200).json({
            success: true,
            message: "Conversation ready",
            conversation: formatConversation(populated, tenantId),
        });
    } catch (error) {
        console.error("Create Conversation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getConversationMessageController(req, res) {
    try {
        const { conversationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID",
            });
        }

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 30)
        );

        const skip = (page - 1) * limit;

        const conversation =
            await ConversationModel.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        const userId = req.user._id;

        if (!isParticipant(conversation, userId)) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to view this conversation",
            });
        }

        const [messages, total] = await Promise.all([
            MessageModel.find({ conversation: conversationId })
                .populate("sender", USER_SELECT)
                .populate("receiver", USER_SELECT)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            MessageModel.countDocuments({
                conversation: conversationId,
            }),
        ]);

        // API returns chronological order for the chat UI while
        // pagination remains newest-first at the database level.
        messages.reverse();

        return res.status(200).json({
            success: true,
            count: messages.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + messages.length < total,
            messages,
        });
    } catch (error) {
        console.error(
            "Get Conversation Messages Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getMyConversationController(req, res) {
    try {
        const userId = req.user._id;

        const conversations =
            await ConversationModel.find({
                $or: [
                    { buyer: userId },
                    { owner: userId },
                ],
            })
                .populate("buyer", USER_SELECT)
                .populate("owner", USER_SELECT)
                .populate("room", ROOM_SELECT)
                .sort({
                    lastMessageAt: -1,
                    updatedAt: -1,
                });

        const formatted = conversations
            .map((conversation) =>
                formatConversation(conversation, userId)
            )
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            count: formatted.length,
            conversations: formatted,
        });
    } catch (error) {
        console.error(
            "Get My Conversations Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function sendMessageController(req, res) {
    try {
        const { conversationId } = req.params;
        const { message } = req.body;
        const io = req.app.get("io");

        const newMessage = await sendMessage({
            conversationId,
            senderId: req.user._id,
            text: message,
            io,
        });

        return res.status(201).json({
            success: true,
            message: newMessage,
        });
    } catch (error) {
        console.error("Send Message Error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message:
                error.message || "Internal server error",
        });
    }
}

export async function markAsReadController(req, res) {
    try {
        const { conversationId } = req.params;
        const io = req.app.get("io");

        const result = await markConversationAsRead(
            conversationId,
            req.user._id,
            io
        );

        return res.status(200).json({
            success: true,
            message: "Messages marked as read",
            markedCount: result.markedCount,
        });
    } catch (error) {
        console.error("Mark As Read Error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message:
                error.message || "Internal server error",
        });
    }
}

export async function getUnreadCountController(req, res) {
    try {
        const total = await getTotalUnreadCount(
            req.user._id
        );

        return res.status(200).json({
            success: true,
            unreadCount: total,
        });
    } catch (error) {
        console.error("Get Unread Count Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getSingleConversationController(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID",
            });
        }

        const conversation =
            await ConversationModel.findById(conversationId)
                .populate("buyer", USER_SELECT)
                .populate("owner", USER_SELECT)
                .populate("room", ROOM_SELECT);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        if (!isParticipant(conversation, userId)) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to view this conversation",
            });
        }

        return res.status(200).json({
            success: true,
            conversation: formatConversation(
                conversation,
                userId
            ),
        });
    } catch (error) {
        console.error(
            "Get Single Conversation Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function deleteMessageController(req, res) {
    try {
        const { conversationId, messageId } = req.params;
        const io = req.app.get("io");

        await deleteMessage({
            conversationId,
            messageId,
            userId: req.user._id,
            io,
        });

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error) {
        console.error("Delete Message Error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message:
                error.message || "Internal server error",
        });
    }
}

export default {
    createConversationController,
    getConversationMessageController,
    getMyConversationController,
    sendMessageController,
    markAsReadController,
    getUnreadCountController,
    getSingleConversationController,
    deleteMessageController,
};

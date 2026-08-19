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
    deleteMessageForMe,
    deleteMessageForEveryone,
    clearConversationForUser,
    getMessagesForUser,
} from "../services/conversation.service.js";
import { isUserOnline } from "../sockets/socket.js";

const USER_SELECT = "username email avatar";
const ROOM_SELECT = "title images rent location availability";

function formatConversation(conversation, currentUserId) {
    if (!conversation) return null;

    const obj = conversation.toObject
        ? conversation.toObject()
        : conversation;

    const currentId = currentUserId ? currentUserId.toString() : "";

    const ownerId = obj.owner?._id
        ? obj.owner._id.toString()
        : (obj.owner ? obj.owner.toString() : "");

    const buyerId = obj.buyer?._id
        ? obj.buyer._id.toString()
        : (obj.buyer ? obj.buyer.toString() : "");

    const isOwner = Boolean(ownerId && ownerId === currentId);
    const isBuyer = Boolean(buyerId && buyerId === currentId);

    const ownerObj = (typeof obj.owner === 'object' && obj.owner !== null && obj.owner._id)
        ? obj.owner
        : { _id: ownerId || "owner", username: "Property Owner", email: "" };

    const buyerObj = (typeof obj.buyer === 'object' && obj.buyer !== null && obj.buyer._id)
        ? obj.buyer
        : { _id: buyerId || "buyer", username: "User", email: "" };

    const currentUserIsOwner = isOwner || (!isBuyer && currentId === ownerId);
    const otherUser = currentUserIsOwner ? buyerObj : ownerObj;

    let finalLastMessage = obj.lastMessage || "";
    let finalLastMessageAt = obj.lastMessageAt;

    // Check if the user cleared this conversation AFTER the last message was sent
    if (obj.clearedAt) {
        const userClearedAt = obj.clearedAt instanceof Map 
            ? obj.clearedAt.get(currentId) 
            : (typeof obj.clearedAt === "object" ? obj.clearedAt[currentId] : null);

        if (userClearedAt && finalLastMessageAt) {
            if (new Date(finalLastMessageAt).getTime() <= new Date(userClearedAt).getTime()) {
                finalLastMessage = "";
            }
        }
    }

    return {
        _id: obj._id,
        room: obj.room,
        owner: ownerObj,
        buyer: buyerObj,
        otherUser,
        lastMessage: finalLastMessage,
        lastMessageAt: finalLastMessageAt,
        unreadCount: getUnreadCountForUser(obj, currentUserId),
        otherUserOnline: otherUser?._id ? isUserOnline(otherUser._id) : false,
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

        if (!room.owner) {
            return res.status(400).json({
                success: false,
                message: "The owner of this room is no longer available",
            });
        }

        if (!room.availability) {
            return res.status(400).json({
                success: false,
                message: "This room is currently sold out",
            });
        }

        const ownerIdStr = room.owner._id
            ? room.owner._id.toString()
            : room.owner.toString();

        if (ownerIdStr === tenantId.toString()) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot chat with yourself about your own room",
            });
        }

        if (
            req.user.role === "owner" &&
            ownerIdStr !== tenantId.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You are currently signed in as a Property Owner. Owners cannot send room inquiry messages to other owners. Only tenants can contact property owners about listings.",
            });
        }

        let conversation = await ConversationModel.findOne({
            room: room._id,
            $or: [
                { buyer: tenantId, owner: room.owner },
                { buyer: room.owner, owner: tenantId },
            ],
        });

        if (!conversation) {
            try {
                conversation = await ConversationModel.create({
                    buyer: tenantId,
                    owner: room.owner,
                    room: room._id,
                });
            } catch (createErr) {
                console.warn("Conversation create fallback:", createErr?.message);
                conversation = await ConversationModel.findOne({
                    room: room._id,
                    $or: [
                        { buyer: tenantId, owner: room.owner },
                        { buyer: room.owner, owner: tenantId },
                    ],
                });
            }
        }

        if (!conversation) {
            return res.status(400).json({
                success: false,
                message: "Unable to start conversation for this room",
            });
        }

        const populated = await ConversationModel.findById(
            conversation._id
        )
            .populate("buyer", USER_SELECT)
            .populate("owner", USER_SELECT)
            .populate("room", ROOM_SELECT);

        const formatted = formatConversation(populated || conversation, tenantId);

        return res.status(200).json({
            success: true,
            message: "Conversation ready",
            conversation: formatted,
        });
    } catch (error) {
        console.error("Create Conversation Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
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

        const userId = req.user._id;

        // Use getMessagesForUser so clearedAt + deletedFor are respected.
        const { messages, total } = await getMessagesForUser({
            conversationId,
            userId,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            count: messages.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: (page - 1) * limit + messages.length < total,
            messages,
        });
    } catch (error) {
        console.error(
            "Get Conversation Messages Error:",
            error
        );

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
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

/**
 * DELETE /conversations/messages/:conversationId/:messageId?scope=me|everyone
 *
 * scope=me       → Delete for me only (other participant still sees it)
 * scope=everyone → Delete for everyone (sender only; shows tombstone to both)
 * default        → everyone (backward compat)
 */
export async function deleteMessageController(req, res) {
    try {
        const { conversationId, messageId } = req.params;
        const scope = req.query.scope === "me" ? "me" : "everyone";
        const io = req.app.get("io");

        if (scope === "me") {
            await deleteMessageForMe({
                conversationId,
                messageId,
                userId: req.user._id,
                io,
            });
        } else {
            await deleteMessageForEveryone({
                conversationId,
                messageId,
                userId: req.user._id,
                io,
            });
        }

        return res.status(200).json({
            success: true,
            message: `Message deleted${scope === "me" ? " for you" : " for everyone"}`,
            scope,
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

/**
 * DELETE /conversations/:conversationId/clear
 *
 * Clears the conversation history for the requesting user only.
 * The other participant's history is unaffected.
 * Messages created AFTER this point will remain visible.
 */
export async function clearConversationController(req, res) {
    try {
        const { conversationId } = req.params;
        const io = req.app.get("io");

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID",
            });
        }

        const result = await clearConversationForUser({
            conversationId,
            userId: req.user._id,
            io,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation cleared",
            clearedAt: result.clearedAt,
        });
    } catch (error) {
        console.error("Clear Conversation Error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
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
    clearConversationController,
};

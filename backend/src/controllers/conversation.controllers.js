import ConversationModel from "../models/conversation.model.js";
import roomModel from "../models/room.model.js";
import MessageModel from "../models/message.model.js";

export async function createConversationController(req, res) {
    try {
        const { roomId } = req.params;

        // Logged in buyer
        const buyerId = req.user._id;

        // Finding Room
        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Checking if buyer is owner
        if (room.owner.toString() === buyerId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot chat with your own room",
            });
        }

        // Finding existing conversation
        let conversation = await ConversationModel.findOne({
            buyer: buyerId,
            owner: room.owner,
            room: room._id,
        });

        // Creating new Conversation
        if (!conversation) {
            conversation = await ConversationModel.create({
                buyer: buyerId,
                owner: room.owner,
                room: room._id,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Conversation ready",
            conversation,
        });

    } catch (error) {
        console.error("Create Conversation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


export async function getConversationMessageController(req,res) {
     try {
        const { conversationId } = req.params;

        // 1. Conversation check
        const conversation = await ConversationModel.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // 2. Authenticated user
        const userId = req.user._id.toString();

        // 3. Check buyer / owner
        const isBuyer =
            conversation.buyer.toString() === userId;

        const isOwner =
            conversation.owner.toString() === userId;

        // 4. Unauthorized user
        if (!isBuyer && !isOwner) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to view this conversation",
            });
        }

        // 5. Get messages
        const messages = await MessageModel.find({
            conversation: conversationId,
        })
            .populate("sender", "username email")
            .sort({ createdAt: 1 });

        // 6. Response
        return res.status(200).json({
            success: true,
            count: messages.length,
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

export async function getMyConversationController(req,res) {
      try {
        const userId = req.user._id;

        const conversations = await ConversationModel.find({
            $or: [
                { buyer: userId },
                { owner: userId }
            ]
        })
            .populate("buyer", "username email")
            .populate("owner", "username email")
            .populate("room")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations,
        });

    } catch (error) {
        console.error("Get My Conversations Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
    
}
export default {
    createConversationController,
    getConversationMessageController,
    getMyConversationController
}
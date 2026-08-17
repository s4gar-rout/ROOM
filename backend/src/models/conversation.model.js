import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },

        unreadCountForOwner: {
            type: Number,
            default: 0,
            min: 0,
        },

        unreadCountForTenant: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index(
    { buyer: 1, owner: 1, room: 1 },
    { unique: true }
);

conversationSchema.index({ owner: 1, lastMessageAt: -1 });
conversationSchema.index({ buyer: 1, lastMessageAt: -1 });

const ConversationModel = mongoose.model(
    "Conversation",
    conversationSchema
);

export default ConversationModel;

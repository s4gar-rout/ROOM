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
    },
    {
        timestamps: true,
    }
);
conversationSchema.index(
    { buyer: 1, owner: 1, room: 1 },
    { unique: true }
);
const ConversationModel = mongoose.model(
    "Conversation",
    conversationSchema
);

export default ConversationModel;
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            maxlength: [1000, "Message cannot exceed 1000 characters"],
        },

        read: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: null,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;

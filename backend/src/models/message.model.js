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

        /**
         * Legacy field — kept for backward compatibility.
         * Old documents with isDeleted:true are treated as isDeletedForEveryone.
         * New code must NOT set this field; use isDeletedForEveryone instead.
         */
        isDeleted: {
            type: Boolean,
            default: false,
        },

        /**
         * Sender sets this to true → "Delete for everyone".
         * Both participants see "This message was deleted".
         */
        isDeletedForEveryone: {
            type: Boolean,
            default: false,
        },

        /**
         * Array of user IDs who have chosen "Delete for me".
         * The message is hidden only for those users.
         * The other participant continues to see the original message.
         */
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
// Index to efficiently query messages visible to a user.
messageSchema.index({ conversation: 1, deletedFor: 1, createdAt: -1 });

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;

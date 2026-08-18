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

        /**
         * Stores per-user "clear chat" timestamps.
         * Key: userId.toString()
         * Value: Date — only messages created AFTER this date are visible to that user.
         *
         * Example:
         *   clearedAt.get("user123") = 2024-01-15T10:00:00Z
         *   → user123 only sees messages with createdAt > 2024-01-15T10:00:00Z
         */
        clearedAt: {
            type: Map,
            of: Date,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Migrate legacy `clearedAt` array to an object so Mongoose can cast it to a Map
conversationSchema.pre('init', function(obj) {
    if (obj.clearedAt && Array.isArray(obj.clearedAt)) {
        const newClearedAt = {};
        for (const item of obj.clearedAt) {
            if (item.user && item.clearedAt) {
                newClearedAt[item.user.toString()] = item.clearedAt;
            }
        }
        obj.clearedAt = newClearedAt;
    }
});

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

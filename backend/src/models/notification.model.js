import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "OWNER_REQUEST_APPROVED",
                "OWNER_REQUEST_REJECTED",
                "ROOM_UNAVAILABLE",
                "ROOM_AVAILABLE",
                "NEW_MESSAGE",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            default: null,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            default: null,
        },

        // Used to make NEW_MESSAGE notifications idempotent.
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({
    user: 1,
    isRead: 1,
    createdAt: -1,
});

// A message should create at most one notification for a user.
// Sparse keeps older/non-message notifications valid.
notificationSchema.index(
    { user: 1, type: 1, message: 1 },
    {
        unique: true,
        partialFilterExpression: {
            type: "NEW_MESSAGE",
            message: { $type: "objectId" },
        },
    }
);

const NotificationModel = mongoose.model(
    "Notification",
    notificationSchema
);

export default NotificationModel;

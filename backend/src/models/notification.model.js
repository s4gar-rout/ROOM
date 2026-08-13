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
    },
    {
        timestamps: true,
    }
);

// Faster retrieval of user's notifications
notificationSchema.index({
    user: 1,
    isRead: 1,
    createdAt: -1,
});

const NotificationModel = mongoose.model(
    "Notification",
    notificationSchema
);

export default NotificationModel;
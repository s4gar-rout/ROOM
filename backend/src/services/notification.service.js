import NotificationModel from "../models/notification.model.js";
import { sendWebPushNotification } from "./webpush.service.js";

const USER_SELECT = "username email avatar";
const ROOM_SELECT = "title images rent location availability";

export async function createNotification({
    userId,
    type,
    title,
    message,
    conversation = null,
    sender = null,
    room = null,
    messageId = null,
    io,
}) {
    const now = new Date();
    const expiresAt = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    let notification;

    try {
        notification = await NotificationModel.create({
            user: userId,
            type,
            title,
            message,
            conversation,
            sender,
            room,
            messageRef: messageId,
            isRead: false,
            readAt: null,
            expiresAt,
        });
    } catch (error) {
        // Duplicate NEW_MESSAGE notification is safe/idempotent.
        if (error.code === 11000 && messageId) {
            notification =
                await NotificationModel.findOne({
                    user: userId,
                    type,
                    messageRef: messageId,
                });

            if (!notification) throw error;
        } else {
            throw error;
        }
    }

    if (io) {
        const populated = await NotificationModel.findById(
            notification._id
        )
            .populate("sender", USER_SELECT)
            .populate("room", ROOM_SELECT)
            .populate("conversation")
            .populate("messageRef", "message createdAt")
            .lean();

        io.to(`user:${userId.toString()}`).emit(
            "notification:new",
            {
                success: true,
                notification: populated,
            }
        );
    }

    // Trigger browser Web Push (best effort, never blocks or fails notification)
    sendWebPushNotification(userId, {
        notificationId: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        senderId: notification.sender,
        roomId: notification.room,
        conversationId: notification.conversation,
    }).catch((pushErr) => {
        console.error("Web push dispatch error:", pushErr.message);
    });

    return notification;
}


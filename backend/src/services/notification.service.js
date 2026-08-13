import NotificationModel from "../models/notification.model.js";

export async function createNotification({
    userId,
    type,
    title,
    message,
    io,
}) {
    // 1. Save notification in database
    const notification = await NotificationModel.create({
        user: userId,
        type,
        title,
        message,
    });

    // 2. Send real-time notification
    if (io) {
        io.to(`user:${userId.toString()}`).emit(
            "newNotification",
            {
                success: true,
                notification: {
                    _id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    isRead: notification.isRead,
                    createdAt: notification.createdAt,
                },
            }
        );
    }

    return notification;
}
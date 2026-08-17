import NotificationModel from "../models/notification.model.js";

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
            message: messageId,
        });
    } catch (error) {
        // Duplicate NEW_MESSAGE notification is safe/idempotent.
        if (error.code === 11000 && messageId) {
            notification =
                await NotificationModel.findOne({
                    user: userId,
                    type,
                    message: messageId,
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
            .populate("message", "message createdAt")
            .lean();

        io.to(`user:${userId.toString()}`).emit(
            "notification:new",
            {
                success: true,
                notification: populated,
            }
        );
    }

    return notification;
}

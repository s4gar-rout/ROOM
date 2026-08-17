import NotificationModel from "../models/notification.model.js";

const USER_SELECT = "username email avatar";
const ROOM_SELECT = "title images rent location availability";

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

async function getMyNotificationsController(req, res) {
    try {
        const notifications =
            await NotificationModel.find({
                user: req.user._id,
            })
                .populate("sender", USER_SELECT)
                .populate("room", ROOM_SELECT)
                .populate("conversation")
                .populate("message", "message createdAt")
                .sort({ createdAt: -1 })
                .lean();

        return res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount: notifications.filter(
                (notification) => !notification.isRead
            ).length,
            notifications,
        });
    } catch (error) {
        console.error(
            "Get Notifications Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

async function markNotificationAsReadController(
    req,
    res
) {
    try {
        const { notificationId } = req.params;

        const notification =
            await NotificationModel.findOneAndUpdate(
                {
                    _id: notificationId,
                    user: req.user._id,
                },
                {
                    $set: {
                        isRead: true,
                    },
                },
                {
                    new: true,
                }
            )
                .populate("sender", USER_SELECT)
                .populate("room", ROOM_SELECT)
                .populate("conversation")
                .populate("message", "message createdAt");

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        console.error(
            "Mark Notification Read Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export default {
    getMyNotificationsController,
    markNotificationAsReadController,
};

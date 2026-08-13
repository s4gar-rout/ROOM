import NotificationModel from "../models/notification.model.js";


// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

async function getMyNotificationsController(req, res) {
    try {
        const notifications = await NotificationModel.find({
            user: req.user._id,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: notifications.length,
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

async function markNotificationAsReadController(req, res) {
    try {
        const { notificationId } = req.params;

        const notification =
            await NotificationModel.findOneAndUpdate(
                {
                    _id: notificationId,
                    user: req.user._id,
                },
                {
                    isRead: true,
                },
                {
                    new: true,
                }
            );

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
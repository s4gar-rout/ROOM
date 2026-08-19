import NotificationModel from "../models/notification.model.js";
import PushSubscriptionModel from "../models/pushSubscription.model.js";
import { sendWebPushNotification } from "../services/webpush.service.js";

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
                .populate({
                    path: "conversation",
                    populate: {
                        path: "room",
                        select: ROOM_SELECT,
                    },
                })
                .populate("messageRef", "message createdAt")
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

        const notification = await NotificationModel.findOne({
            _id: notificationId,
            user: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        // Only update read status, readAt, and expiresAt if the notification is unread.
        // Reading an already-read notification must NOT extend its lifetime.
        if (!notification.isRead) {
            const now = new Date();
            const expiresAt = new Date(
                now.getTime() + 7 * 24 * 60 * 60 * 1000
            );

            notification.isRead = true;
            notification.readAt = now;
            notification.expiresAt = expiresAt;
            await notification.save();
        }

        await notification.populate([
            { path: "sender", select: USER_SELECT },
            { path: "room", select: ROOM_SELECT },
            { path: "conversation" },
            { path: "messageRef", select: "message createdAt" },
        ]);

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

// ==========================================
// SUBSCRIBE TO PUSH NOTIFICATIONS
// ==========================================

async function subscribePushController(req, res) {
    try {
        const { endpoint, keys } = req.body || {};

        if (!endpoint || typeof endpoint !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid push endpoint is required",
            });
        }

        if (!keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({
                success: false,
                message: "Subscription keys (p256dh and auth) are required",
            });
        }

        // Upsert subscription mapped to the authenticated user
        const subscription = await PushSubscriptionModel.findOneAndUpdate(
            { endpoint: endpoint.trim() },
            {
                user: req.user._id,
                endpoint: endpoint.trim(),
                keys: {
                    p256dh: keys.p256dh.trim(),
                    auth: keys.auth.trim(),
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Push subscription registered successfully",
            subscriptionId: subscription._id,
        });
    } catch (error) {
        console.error("Subscribe Push Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to register push subscription",
        });
    }
}

// ==========================================
// UNSUBSCRIBE FROM PUSH NOTIFICATIONS
// ==========================================

async function unsubscribePushController(req, res) {
    try {
        const endpoint = req.body?.endpoint || req.query?.endpoint;

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                message: "Push endpoint is required for unsubscription",
            });
        }

        const result = await PushSubscriptionModel.deleteOne({
            endpoint: endpoint.trim(),
            user: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Push subscription removed successfully",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Unsubscribe Push Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to remove push subscription",
        });
    }
}

// ==========================================
// TEST PUSH NOTIFICATION (Protected)
// ==========================================

async function testPushController(req, res) {
    try {
        const user = req.user;

        await sendWebPushNotification(user._id, {
            type: "TEST_NOTIFICATION",
            title: "ROOM Notification Test",
            message: `Hello ${user.username || "there"}! Browser push notifications are working perfectly.`,
        });

        return res.status(200).json({
            success: true,
            message: "Test push notification triggered",
        });
    } catch (error) {
        console.error("Test Push Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to trigger test push notification",
        });
    }
}

// ==========================================
// DELETE SINGLE NOTIFICATION
// ==========================================

async function deleteNotificationController(req, res) {
    try {
        const { notificationId } = req.params;

        const result = await NotificationModel.deleteOne({
            _id: notificationId,
            user: req.user._id,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// ==========================================
// CLEAR ALL NOTIFICATIONS FOR USER
// ==========================================

async function clearAllNotificationsController(req, res) {
    try {
        await NotificationModel.deleteMany({
            user: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "All notifications cleared successfully",
        });
    } catch (error) {
        console.error("Clear All Notifications Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export default {
    getMyNotificationsController,
    markNotificationAsReadController,
    deleteNotificationController,
    clearAllNotificationsController,
    subscribePushController,
    unsubscribePushController,
    testPushController,
};

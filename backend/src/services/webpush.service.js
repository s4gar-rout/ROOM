import webpush from "web-push";
import { config } from "../config/config.js";
import PushSubscriptionModel from "../models/pushSubscription.model.js";

// Initialize VAPID details once
webpush.setVapidDetails(
    config.VAPID_SUBJECT,
    config.VAPID_PUBLIC_KEY,
    config.VAPID_PRIVATE_KEY
);

/**
 * Send Web Push notification to all active devices/browsers of a user.
 * Best-effort delivery: Errors are safely caught and logged, never throwing.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {Object} payloadData - { notificationId, type, title, message, senderId, roomId, conversationId, url }
 */
export async function sendWebPushNotification(userId, payloadData) {
    if (!userId) return;

    try {
        const subscriptions = await PushSubscriptionModel.find({
            user: userId,
        }).lean();

        if (!subscriptions || subscriptions.length === 0) {
            return;
        }

        const payloadString = JSON.stringify({
            notificationId: payloadData.notificationId
                ? payloadData.notificationId.toString()
                : undefined,
            type: payloadData.type || "ROOM_NOTIFICATION",
            title: payloadData.title || "ROOM",
            message: payloadData.message || "You have a new update.",
            senderId: payloadData.senderId
                ? payloadData.senderId.toString()
                : undefined,
            roomId: payloadData.roomId
                ? payloadData.roomId.toString()
                : undefined,
            conversationId: payloadData.conversationId
                ? payloadData.conversationId.toString()
                : undefined,
            url: payloadData.url || undefined,
            timestamp: Date.now(),
        });

        const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth,
                },
            };

            try {
                await webpush.sendNotification(
                    pushSubscription,
                    payloadString
                );
            } catch (err) {
                const statusCode = err.statusCode || err.status;

                // 404 or 410 indicates the subscription is expired or unsubscribed on browser
                if (statusCode === 404 || statusCode === 410) {
                    try {
                        await PushSubscriptionModel.deleteOne({ _id: sub._id });
                    } catch (cleanupErr) {
                        console.error(
                            "Failed to remove stale push subscription:",
                            cleanupErr.message
                        );
                    }
                } else if (statusCode === 413) {
                    console.warn(
                        "Web push payload too large for subscription:",
                        sub._id
                    );
                } else {
                    console.error(
                        "Web push send error (status " +
                            statusCode +
                            "): " +
                            err.message
                    );
                }
            }
        });

        await Promise.all(sendPromises);
    } catch (error) {
        console.error("sendWebPushNotification unexpected error:", error.message);
    }
}

/**
 * Send direct push notification to a specific subscription (useful for testing)
 */
export async function sendDirectPushNotification(subscription, payloadData) {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
        throw new Error("Invalid subscription object");
    }

    const payloadString = JSON.stringify({
        title: payloadData.title || "ROOM Test Notification",
        message: payloadData.message || "Browser push notifications are active!",
        type: payloadData.type || "TEST",
        timestamp: Date.now(),
    });

    return webpush.sendNotification(subscription, payloadString);
}

export default {
    sendWebPushNotification,
    sendDirectPushNotification,
};

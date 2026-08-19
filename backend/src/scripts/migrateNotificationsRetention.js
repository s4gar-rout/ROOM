import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import { config } from "../config/config.js";
import NotificationModel from "../models/notification.model.js";

const UNREAD_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const READ_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;     // 7 days

export async function migrateNotificationRetention() {
    console.log("Starting notification retention backfill migration...");

    // Find all notifications missing expiresAt
    const unmigratedNotifications = await NotificationModel.find({
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
        ],
    }).lean();

    console.log(
        `Found ${unmigratedNotifications.length} notifications to migrate.`
    );

    if (unmigratedNotifications.length === 0) {
        console.log("All notifications already have expiresAt configured.");
        return { migrated: 0 };
    }

    const bulkOps = [];

    for (const notif of unmigratedNotifications) {
        const createdAt =
            notif.createdAt instanceof Date
                ? notif.createdAt
                : notif.createdAt
                ? new Date(notif.createdAt)
                : notif._id.getTimestamp();

        let expiresAt;
        let readAt = notif.readAt || null;

        if (notif.isRead) {
            if (notif.readAt) {
                const readDate =
                    notif.readAt instanceof Date
                        ? notif.readAt
                        : new Date(notif.readAt);
                expiresAt = new Date(readDate.getTime() + READ_RETENTION_MS);
            } else {
                // Fallback for older read notifications without readAt: createdAt + 7 days
                expiresAt = new Date(createdAt.getTime() + READ_RETENTION_MS);
            }
        } else {
            // Unread notification: createdAt + 30 days
            expiresAt = new Date(createdAt.getTime() + UNREAD_RETENTION_MS);
            readAt = null;
        }

        bulkOps.push({
            updateOne: {
                filter: { _id: notif._id },
                update: {
                    $set: {
                        expiresAt,
                        readAt,
                    },
                },
            },
        });
    }

    if (bulkOps.length > 0) {
        const result = await NotificationModel.bulkWrite(bulkOps);
        console.log(
            `Successfully migrated ${result.modifiedCount} notifications.`
        );
        return { migrated: result.modifiedCount };
    }

    return { migrated: 0 };
}

// Standalone execution support
if (process.argv[1] && process.argv[1].includes("migrateNotificationsRetention.js")) {
    (async () => {
        try {
            await mongoose.connect(config.MONGO_URI);
            console.log("Connected to MongoDB for retention migration");

            // Ensure index is created
            await NotificationModel.syncIndexes();
            console.log("Notification indexes synced (including expiresAt TTL index).");

            await migrateNotificationRetention();
            console.log("Migration completed successfully.");
            await mongoose.disconnect();
            process.exit(0);
        } catch (error) {
            console.error("Migration failed:", error);
            process.exit(1);
        }
    })();
}

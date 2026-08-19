import express from "express";

import notificationControllers from "../controllers/notification.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

router.get(
    "/",
    authMiddleware,
    notificationControllers.getMyNotificationsController
);

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

router.patch(
    "/:notificationId/read",
    authMiddleware,
    notificationControllers.markNotificationAsReadController
);

// ==========================================
// PUSH NOTIFICATION SUBSCRIPTION ENDPOINTS
// ==========================================

/**
 * @route POST /api/notifications/push/subscribe
 * @description Register or update a browser push subscription for authenticated user
 * @access Protected
 */
router.post(
    "/push/subscribe",
    authMiddleware,
    notificationControllers.subscribePushController
);

/**
 * @route DELETE /api/notifications/push/unsubscribe
 * @description Remove a single device push subscription for authenticated user
 * @access Protected
 */
router.delete(
    "/push/unsubscribe",
    authMiddleware,
    notificationControllers.unsubscribePushController
);

/**
 * @route POST /api/notifications/push/test
 * @description Trigger a test push notification to user's registered devices
 * @access Protected
 */
router.post(
    "/push/test",
    authMiddleware,
    notificationControllers.testPushController
);

export default router;
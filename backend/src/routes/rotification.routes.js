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


export default router;
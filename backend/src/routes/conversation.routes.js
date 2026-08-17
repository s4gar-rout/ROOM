import express from "express";
import ConversationController from "../controllers/conversation.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/unread-count",
    authMiddleware,
    ConversationController.getUnreadCountController
);

router.get(
    "/my",
    authMiddleware,
    ConversationController.getMyConversationController
);

router.get(
    "/single/:conversationId",
    authMiddleware,
    ConversationController.getSingleConversationController
);

router.post(
    "/:roomId",
    authMiddleware,
    ConversationController.createConversationController
);

router.get(
    "/messages/:conversationId",
    authMiddleware,
    ConversationController.getConversationMessageController
);

router.post(
    "/messages/:conversationId",
    authMiddleware,
    ConversationController.sendMessageController
);

router.patch(
    "/messages/:conversationId/read",
    authMiddleware,
    ConversationController.markAsReadController
);

router.delete(
    "/messages/:conversationId/:messageId",
    authMiddleware,
    ConversationController.deleteMessageController
);

export default router;

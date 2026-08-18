import express from "express";
import ConversationController from "../controllers/conversation.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";

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

// Create or get conversation for a room listing.
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

/**
 * DELETE /conversations/messages/:conversationId/:messageId?scope=me|everyone
 * scope=me       → removes only for requesting user (deletedFor[])
 * scope=everyone → sets isDeletedForEveryone=true (sender only)
 */
router.delete(
    "/messages/:conversationId/:messageId",
    authMiddleware,
    ConversationController.deleteMessageController
);

/**
 * DELETE /conversations/:conversationId/clear
 * Clears all messages for the requesting user (sets clearedAt timestamp).
 * The other participant's history is unaffected.
 */
router.delete(
    "/:conversationId/clear",
    authMiddleware,
    ConversationController.clearConversationController
);

export default router;

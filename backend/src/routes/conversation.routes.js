import express from "express";
import ConversationController from "../controllers/conversation.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();


// Create conversation
router.post(
    "/:roomId",
    authMiddleware,
    requireRole("tenant"),
    ConversationController.createConversationController
);


// Get conversation messages
router.get(
    "/messages/:conversationId",
    authMiddleware,
    ConversationController.getConversationMessageController
);


// Get my conversations
router.get(
    "/my",
    authMiddleware,
    ConversationController.getMyConversationController
);


export default router;
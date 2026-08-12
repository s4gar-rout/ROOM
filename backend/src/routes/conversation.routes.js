import express from "express";
import ConversationController from "../controllers/conversation.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();


/**
 * create conversation
 * method: POST
 * url: /api/conversation/:roomId
 * authentication: required
 */
router.post(
    "/:roomId",
    authMiddleware,
    ConversationController.createConversationController
);




/**
 * Get conversation messages
 * Method: GET
 * URL: /api/conversation/message/:conversationId
 * Authentication: Required
 */
router.get(
    "/messages/:conversationId",
    authMiddleware,
    ConversationController.getConversationMessageController
);


/**
 * Get My Conversations
 * Method: GET
 * URL: /api/conversation/my
 * Authentication: Required
 */
router.get(
    "/my",
    authMiddleware,
    ConversationController.getMyConversationController
);



export default router;  
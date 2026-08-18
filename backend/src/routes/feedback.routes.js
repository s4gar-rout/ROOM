import express from "express";
import { createFeedbackController } from "../controllers/feedback.controllers.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware.js";
import { createFeedbackValidation } from "../validators/feedback.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

/**
 * @desc Create new feedback
 * @route POST /api/feedback
 * @access Public (Optional Auth)
 */
router.post(
    "/",
    optionalAuthMiddleware,
    createFeedbackValidation,
    validateRequest,
    createFeedbackController
);

export default router;

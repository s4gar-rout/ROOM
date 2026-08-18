import express from "express";
import { createIssueController } from "../controllers/issue.controllers.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuth.middleware.js";
import { createIssueValidation } from "../validators/issue.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

/**
 * @desc Create a new issue report
 * @route POST /api/issues
 * @access Public (Optional Auth)
 */
router.post(
    "/",
    optionalAuthMiddleware,
    createIssueValidation,
    validateRequest,
    createIssueController
);

export default router;

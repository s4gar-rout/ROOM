import express from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { userIdValidation } from "../validators/admin.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import * as issueController from "../controllers/issue.controllers.js";
import * as feedbackController from "../controllers/feedback.controllers.js";
import { updateIssueStatusValidation, issueIdValidation } from "../validators/issue.validator.js";
import { updateFeedbackStatusValidation, feedbackIdValidation } from "../validators/feedback.validator.js";

const router = express.Router();

/**
 * @desc Get dashboard stats
 * @route GET /api/admin/stats
 * @access Private/Admin
 */
router.get(
    "/stats",
    authMiddleware,
    requireRole("admin"),
    adminController.getDashboardStatsController
);

/**
 * @desc Block user
 * @route PATCH /api/admin/users/:userId/block
 * @access Private/Admin
 */

router.patch(
    "/users/:userId/block",
    authMiddleware,
    requireRole("admin"),
    adminController.blockUserController
);


/**
 * @desc Unblock user
 * @route PATCH /api/admin/users/:userId/unblock
 * @access Private/Admin
 */

router.patch(
    "/users/:userId/unblock",
    authMiddleware,
    requireRole("admin"),
    adminController.unblockUserController
);


/**
 * @desc Get all users
 * @route GET /api/admin/users
 * @access Private/Admin
 */

router.get(
    "/users",
    authMiddleware,
    requireRole("admin"),
    adminController.getAllUsersController
);



/**
 * @desc Get all rooms
 * @route GET /api/admin/rooms
 * @access Private/Admin
 */

router.get(
    "/rooms",
    authMiddleware,
    requireRole("admin"),
    adminController.getAllRoomsController
);


/**
 * @desc Delete room
 * @route DELETE /api/admin/rooms/:roomId
 * @access Private/Admin
 */

router.delete(
    "/rooms/:roomId",
    authMiddleware,
    requireRole("admin"),
    adminController.deleteRoomController
);


// ==========================================
// ISSUES ADMIN ROUTES
// ==========================================

router.get(
    "/issues",
    authMiddleware,
    requireRole("admin"),
    issueController.getAllIssuesController
);

router.patch(
    "/issues/:id/status",
    authMiddleware,
    requireRole("admin"),
    updateIssueStatusValidation,
    validateRequest,
    issueController.updateIssueStatusController
);

router.delete(
    "/issues/:id",
    authMiddleware,
    requireRole("admin"),
    issueIdValidation,
    validateRequest,
    issueController.deleteIssueController
);

// ==========================================
// FEEDBACK ADMIN ROUTES
// ==========================================

router.get(
    "/feedback",
    authMiddleware,
    requireRole("admin"),
    feedbackController.getAllFeedbackController
);

router.patch(
    "/feedback/:id/status",
    authMiddleware,
    requireRole("admin"),
    updateFeedbackStatusValidation,
    validateRequest,
    feedbackController.updateFeedbackStatusController
);

router.delete(
    "/feedback/:id",
    authMiddleware,
    requireRole("admin"),
    feedbackIdValidation,
    validateRequest,
    feedbackController.deleteFeedbackController
);

export default router;
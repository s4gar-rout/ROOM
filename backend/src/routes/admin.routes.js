import express from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { userIdValidation } from "../validators/admin.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
const router = express.Router();


/**
 * @desc Request owner role
 * @route POST /api/admin/request-owner
 * @access Private/Tenant
 */
router.post(
    "/request-owner",
    authMiddleware,
    requireRole("tenant"),
    adminController.requestOwnerController
);

/*
 * @desc Update owner request
 * @route PATCH /api/admin/owner-request/:userId
 * @access Private/Admin
 */

router.patch(
    "/owner-request/:userId",
    authMiddleware,
    requireRole("admin"),
    userIdValidation,
    validateRequest,
    adminController.updateOwnerRequestController
);


/**
 * @desc Get pending owner requests
 * @route GET /api/admin/owner-requests/pending
 * @access Private/Admin
 */

router.get(
    "/owner-requests/pending",
    authMiddleware,
    requireRole("admin"),
    adminController.getPendingOwnerRequestsController
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
export default router;
import express from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { userIdValidation } from "../validators/admin.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
const router = express.Router();

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
export default router;
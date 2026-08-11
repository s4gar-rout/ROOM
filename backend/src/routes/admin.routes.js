import express from "express";
import adminController from "../controllers/admin.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = express.Router();


/**
 * @desc Request owner role
 * @route POST /api/admin/request-owner
 * @access Private/Tenant
 */
router.post(
    "/request-owner",
    authMiddleware,
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
    adminController.updateOwnerRequestController
);

export default router;
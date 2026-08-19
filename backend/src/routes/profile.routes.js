import express from "express";

import profileControllers from "../controllers/profile.controllers.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.middleware.js";

import { multerErrorHandler } from "../middlewares/multerError.middleware.js";

import {
    updateProfileValidation,
    changePasswordValidation,
    avatarValidation,
} from "../validators/profile.validator.js";

import {
    validateRequest,
} from "../middlewares/validate.middleware.js";

const router = express.Router();


// ==========================================
// GET MY PROFILE
// ==========================================

router.get(
    "/me",
    authMiddleware,
    profileControllers.getMyProfileController
);


// ==========================================
// UPDATE PROFILE
// ==========================================

router.patch(
    "/update",
    authMiddleware,
    updateProfileValidation,
    validateRequest,
    profileControllers.updateProfileController
);


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.patch(
    "/change-password",
    authMiddleware,
    changePasswordValidation,
    validateRequest,
    profileControllers.changePasswordController
);


// ==========================================
// UPLOAD PROFILE PHOTO
// ==========================================

router.patch(
    "/avatar",
    authMiddleware,
    upload.single("avatar"),
    multerErrorHandler,
    avatarValidation,
    validateRequest,
    profileControllers.updateAvatarController
);

// ==========================================
// DELETE ACCOUNT FLOW
// ==========================================

/**
 * @route POST /api/profile/delete-account/send-otp
 * @description Send OTP to email for account deletion verification
 * @access Protected
 */
router.post(
    "/delete-account/send-otp",
    authMiddleware,
    profileControllers.sendDeleteAccountOtpController
);

/**
 * @route POST /api/profile/delete-account/verify
 * @description Verify OTP and permanently delete account and related data
 * @access Protected
 */
router.post(
    "/delete-account/verify",
    authMiddleware,
    profileControllers.verifyAndDeleteAccountController
);

export default router;
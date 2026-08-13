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

import { validateRequest } from "../middlewares/validate.middleware.js";

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
// UPDATE AVATAR
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


export default router;
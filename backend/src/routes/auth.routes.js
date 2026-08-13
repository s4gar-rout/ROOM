import express from "express";
import authControllers from "../controllers/auth.controllers.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import passwordControllers from "../controllers/password.controllers.js";
import { rateLimiter } from "../middlewares/rateLimit.middleware.js";
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post("/register", registerValidator, validateRequest, authControllers.registerController);


/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post(
    "/login",
    rateLimiter({
        keyPrefix: "login",
        limit: 5,
        windowInSeconds: 15 * 60,
    }),
    loginValidator,
    validateRequest,
    authControllers.loginController
);



/**
 * @route GET/api/auth/me
 * @description get loggedin user
 * @access Protected
 */

router.get("/me", authMiddleware, authControllers.getMeController);


/**
 * @route POST /api/auth/refresh
 * @description Refresh access token
 * @access Public
 */
router.post("/refresh", authControllers.refreshTokenController);



/**
 * @route POST /api/auth/logout
 * @description Logout a user
 * @access Private
 */

router.post(
    "/logout",
    authControllers.logoutController
);


/**
 * @route POST /api/auth/forgot-password
 * @description Send password reset OTP
 * @access Public
 */

router.post(
    "/forgot-password",
    rateLimiter({
        keyPrefix: "forgot-password",
        limit: 3,
        windowInSeconds: 15 * 60,
    }),
    passwordControllers.forgotPasswordController
);

/**
 * @route POST /api/auth/verify-reset-otp
 * @description Verify reset OTP
 * @access Public
 * **/
router.post(
    "/verify-reset-otp",
    rateLimiter({
        keyPrefix: "verify-reset-otp",
        limit: 5,
        windowInSeconds: 5 * 60,
    }),
    passwordControllers.verifyResetOtpController
);

/**
 * @route POST /api/auth/reset-password
 * @description Reset password using OTP
 * @access Public
 */

router.post(
    "/reset-password",
    passwordControllers.resetPasswordController
);

export default router;
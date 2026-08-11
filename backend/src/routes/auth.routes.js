import express from "express";
import authControllers from "../controllers/auth.controllers.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
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
router.post("/login", loginValidator, validateRequest, authControllers.loginController);



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

router.post("/logout", authMiddleware, authControllers.logoutController);


export default router;
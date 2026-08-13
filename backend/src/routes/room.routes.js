import express from 'express'
import roomController from "../controllers/room.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
    createRoomValidation,
    updateRoomValidation,
    roomQueryValidation,
    roomIdValidation,
    deleteRoomImageValidation,
} from "../validators/room.validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { multerErrorHandler } from "../middlewares/multerError.middleware.js";

const router = express.Router()


/**
 * @desc Create a new room
 * @route POST /api/rooms/listings
 * @access Private/Owner
 **/


router.post(
    "/listings",
    authMiddleware,
    requireRole("owner"),
    upload.array("images", 5),
    multerErrorHandler,
    createRoomValidation,
    validateRequest,
    roomController.createRoomController
);

/** 
 * @desc Get All rooms
 * @route GET /api/rooms/getall
 * @access Public
**/

router.get(
    "/getall",
    roomQueryValidation,
    validateRequest,
    roomController.getAllRoomsController
);


/**
 * @desc Get my rooms
 * @route GET /api/rooms/my-room
 * @access Private/Owner
 **/

router.get("/my-rooms", authMiddleware, requireRole("owner"), roomController.getMyRoomController)

/**
 * @desc Get room by ID
 * @route GET /api/rooms/single/:roomId
 * @access Public
 **/


router.get(
    "/single/:roomId",
    roomIdValidation,
    validateRequest,
    roomController.getSingleRoomDetailsController
);



/**
 * @desc Update room details
 * @route PATCH /api/rooms/update/:roomId
 * @access Private/Owner
 **/
router.patch(
    "/update/:roomId",
    authMiddleware,
    requireRole("owner"),
    roomIdValidation,
    updateRoomValidation,
    validateRequest,
    roomController.updateRoomController
);


/**
 * @desc Delete room
 * @route DELETE /api/rooms/delete/:roomId
 * @access Private/Owner
 **/
router.delete(
    "/delete/:roomId",
    authMiddleware,
    requireRole("owner"),
    roomIdValidation,
    validateRequest,
    roomController.deleteRoomController
);



/**
 * @desc Update room availability
 * @route PATCH /api/rooms/update-availability/:roomId
 * @access Private/Owner
 **/
router.patch(
    "/update-availability/:roomId",
    authMiddleware,
    requireRole("owner"),
    roomIdValidation,
    validateRequest,
    roomController.updateRoomAvailabilityController
);



/**
 * @desc Delete a single image from a room
 * @route DELETE /api/rooms/delete-image/:roomId/:fileId
 * @access Private/Owner
 **/
router.delete(
    "/delete-image/:roomId/:fileId",
    authMiddleware,
    requireRole("owner"),
    deleteRoomImageValidation,
    validateRequest,
    roomController.deleteRoomImageController
);
export default router;


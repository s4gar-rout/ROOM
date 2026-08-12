import express from 'express'
import roomController from "../controllers/room.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { createRoomValidation } from "../validators/room.validator.js";
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

router.get("/getall", roomController.getAllRoomsController
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


router.get("/single/:roomId", roomController.getSingleRoomDetailsController)



/**
 * @desc Update room details
 * @route PATCH /api/rooms/update/:roomId
 * @access Private/Owner
 **/
router.patch("/update/:roomId", authMiddleware, requireRole("owner"), roomController.updateRoomController);


/**
 * @desc Delete room
 * @route DELETE /api/rooms/delete/:roomId
 * @access Private/Owner
 **/
router.delete("/delete/:roomId", authMiddleware, requireRole("owner"), roomController.deleteRoomController);



/**
 * @desc Update room availability
 * @route PATCH /api/rooms/update-availability/:roomId
 * @access Private/Owner
 **/
router.patch("/update-availability/:roomId", authMiddleware, requireRole("owner"), roomController.updateRoomAvailabilityController);



/**
 * @desc Delete a single image from a room
 * @route DELETE /api/rooms/delete-image/:roomId/:fileId
 * @access Private/Owner
 **/
router.delete(
    "/delete-image/:roomId/:fileId",
    authMiddleware,
    requireRole("owner"),
    roomController.deleteRoomImageController
);
export default router;


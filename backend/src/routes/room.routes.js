import express from 'express'
import roomController from "../controllers/room.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
const router = express.Router()


/**
 * @desc Create a new room
 * @route POST /api/rooms/listings
 * @access Private/Owner
 **/

router.post("/listings", authMiddleware, requireRole("owner"), upload.array("images", 5), roomController.createRoomController
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


export default router;
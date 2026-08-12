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
 * @route GET /api/rooms/:roomId
 * @access Public
 **/

router.get("/:roomId", roomController.getSingleRoomDetailsController)



/**
 * @desc Update room details
 * @route PATCH /api/rooms/:roomId
 * @access Private/Owner
 **/
router.patch("/:roomId",authMiddleware,requireRole("owner"),roomController.updateRoomController);



export default router;
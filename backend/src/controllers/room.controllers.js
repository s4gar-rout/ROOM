import roomModel from "../models/room.model.js";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js"


//Create room 
export async function createRoomController(req, res) {
    try {
        const {
            title,
            description,
            rent,
            location,
            roomType,
            facilities,
        } = req.body;

        // 1. Required fields
        if (
            !title ||
            !description ||
            rent === undefined ||
            !location ||
            !roomType
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title, description, rent, location and room type are required",
            });
        }

        // 2. Upload images to ImageKit
        let roomImages = [];

        if (req.files && req.files.length > 0) {
            roomImages = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname,
                        folder: "rooms",
                    });

                    return result.url;
                })
            );
        }

        // 3. Create room
        const room = await roomModel.create({
            owner: req.user._id,
            title: title.trim(),
            description: description.trim(),
            rent: Number(rent),
            location: location.trim(),
            roomType,
            facilities: facilities
                ? typeof facilities === "string"
                    ? JSON.parse(facilities)
                    : facilities
                : [],
            images: roomImages,
        });

        // 4. Response
        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            room,
        });

    } catch (error) {
        console.error("Create Room Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


//Get all rooms
export async function getAllRoomsController(req, res) {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit));

        const skip = (pageNumber - 1) * limitNumber;

        // Only available rooms
        const query = {
            availability: true,
        };

        const total = await roomModel.countDocuments(query);

        const rooms = await roomModel.find(query)
            .populate("owner", "username email contact")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        return res.status(200).json({
            success: true,
            message: "Rooms fetched successfully",
            rooms,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / limitNumber),
                limit: limitNumber,
            },
        });

    } catch (error) {
        console.error("Get All Rooms Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


//Get single room details
export async function getSingleRoomDetailsController(req, res) {
    try {
        const { roomId } = req.params;

        const room = await roomModel.findById(roomId)
            .populate("owner", "username email contact");

        // Room not found
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room fetched successfully",
            room,
        });

    } catch (error) {
        console.error("Get Room By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


//Get my room 
export async function getMyRoomController(req, res) {
    try {
        const ownerId = req.user._id;

        const rooms = await roomModel.find({
            owner: ownerId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Your rooms fetched successfully",
            rooms,
        });

    } catch (error) {
        console.error("Get My Rooms Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

//Update room details
export async function updateRoomController(req, res) {
    try {
        const { roomId } = req.params;

        const {
            title,
            description,
            rent,
            location,
            roomType,
            facilities,
            availability,
        } = req.body;

        // Find room
        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Check ownership
        if (room.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this room",
            });
        }

        // Update only provided fields
        if (title !== undefined) room.title = title.trim();

        if (description !== undefined) {
            room.description = description.trim();
        }

        if (rent !== undefined) {
            room.rent = Number(rent);
        }

        if (location !== undefined) {
            room.location = location.trim();
        }

        if (roomType !== undefined) {
            room.roomType = roomType;
        }

        if (facilities !== undefined) {
            room.facilities =
                typeof facilities === "string"
                    ? JSON.parse(facilities)
                    : facilities;
        }

        if (availability !== undefined) {
            room.availability =
                availability === true || availability === "true";
        }

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Room updated successfully",
            room,
        });

    } catch (error) {
        console.error("Update Room Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
}


//Delete room
export async function deleteRoomController(req, res) {
    try {
        const { roomId } = req.params;

        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Ownership check
        if (room.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this room",
            });
        }

        await roomModel.findByIdAndDelete(roomId);

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });

    } catch (error) {
        console.error("Delete Room Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

//Room availability toggle
export async function updateRoomAvailabilityController(req, res) {
    try {
        const { roomId } = req.params;
        const { availability } = req.body;

        // Check value
        if (typeof availability !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Availability must be true or false",
            });
        }

        // Find room
        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Check owner
        if (room.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this room",
            });
        }

        // Update availability
        room.availability = availability;

        await room.save();

        return res.status(200).json({
            success: true,
            message: availability
                ? "Room is now available"
                : "Room is now unavailable",
            room: {
                id: room._id,
                availability: room.availability,
            },
        });

    } catch (error) {
        console.error("Update Room Availability Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


export default {
    createRoomController,
    getAllRoomsController,
    getSingleRoomDetailsController,
    getMyRoomController,
    updateRoomController,
    deleteRoomController,
    updateRoomAvailabilityController,
}
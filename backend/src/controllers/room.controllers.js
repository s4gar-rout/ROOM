import roomModel from "../models/room.model.js";
import userModel from "../models/user.model.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";

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

        // Upload images to ImageKit
        let roomImages = [];

        if (req.files && req.files.length > 0) {
            roomImages = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname,
                        folder: "rooms",
                    });

                    return {
                        url: result.url,
                        fileId: result.fileId,
                    };
                })
            );
        }

        // Parse facilities
        let parsedFacilities = [];

        if (facilities) {
            parsedFacilities =
                typeof facilities === "string"
                    ? JSON.parse(facilities)
                    : facilities;
        }

        // Create room
        const room = await roomModel.create({
            owner: req.user._id,
            title: title.trim(),
            description: description.trim(),
            rent: Number(rent),
            location: location.trim(),
            roomType,
            facilities: parsedFacilities,
            images: roomImages,
        });

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
        const {
            location,
            roomType,
            minRent,
            maxRent,
            availability,
            search,
            sort,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        // Location filter
        if (location) {
            query.location = {
                $regex: location.trim(),
                $options: "i",
            };
        }

        // Room type filter
        if (roomType) {
            query.roomType = roomType;
        }

        // Rent filter
        if (minRent || maxRent) {
            query.rent = {};

            if (minRent) {
                query.rent.$gte = Number(minRent);
            }

            if (maxRent) {
                query.rent.$lte = Number(maxRent);
            }
        }

        // Availability filter
        if (availability !== undefined) {
            query.availability = availability === "true";
        }

        // Search title / description / location
        if (search) {
            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    location: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Pagination
        const pageNumber = Math.max(1, Number(page));
        const limitNumber = Math.max(1, Number(limit));

        const skip = (pageNumber - 1) * limitNumber;

        // Sorting
        let sortOption = {};

        if (sort === "rentAsc") {
            sortOption.rent = 1;
        } else if (sort === "rentDesc") {
            sortOption.rent = -1;
        } else if (sort === "oldest") {
            sortOption.createdAt = 1;
        } else {
            // Default: newest first
            sortOption.createdAt = -1;
        }

        const total = await roomModel.countDocuments(query);

        const rooms = await roomModel.find(query)
            .populate("owner", "username email contact")
            .sort(sortOption)
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

        // 1. Validate room ID
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID",
            });
        }

        // 2. Find room
        const room = await roomModel.findById(roomId)
            .populate("owner", "username email contact");

        // 3. Room not found
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // 4. Response
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

//Delete room images
export async function deleteRoomImageController(req, res) {
    try {
        const { roomId, fileId } = req.params;

        // 1. Find room
        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // 2. Check ownership
        if (room.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to modify this room",
            });
        }

        // 3. Find image
        const image = room.images.find(
            (img) => img.fileId === fileId
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        // 4. Delete image from ImageKit
        await deleteFile(fileId);

        // 5. Remove image from MongoDB
        room.images = room.images.filter(
            (img) => img.fileId !== fileId
        );

        await room.save();

        // 6. Response
        return res.status(200).json({
            success: true,
            message: "Room image deleted successfully",
            room,
        });

    } catch (error) {
        console.error("Delete Room Image Error:", error);

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
    deleteRoomImageController
}
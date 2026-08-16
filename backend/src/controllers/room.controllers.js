import roomModel from "../models/room.model.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";

// ===============================
// Create Room
// ===============================

export async function createRoomController(req, res) {
    const uploadedFileIds = [];

    try {
        const {
            title,
            description,
            rent,
            location,
            roomType,
            facilities,
        } = req.body;

        // Parse facilities
        let parsedFacilities = [];

        if (facilities) {
            parsedFacilities =
                typeof facilities === "string"
                    ? JSON.parse(facilities)
                    : facilities;
        }

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

                    uploadedFileIds.push(result.fileId);

                    return {
                        url: result.url,
                        fileId: result.fileId,
                    };
                })
            );
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

        // Cleanup uploaded ImageKit files if DB operation fails
        if (uploadedFileIds.length > 0) {
            await Promise.allSettled(
                uploadedFileIds.map((fileId) => deleteFile(fileId))
            );
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ===============================
// Get All Rooms
// ===============================

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

        // Escape regex special characters
        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        };

        // Location filter
        if (location) {
            const safeLocation = escapeRegex(location.trim());

            query.location = {
                $regex: safeLocation,
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
            const safeSearch = escapeRegex(search.trim());

            query.$or = [
                {
                    title: {
                        $regex: safeSearch,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: safeSearch,
                        $options: "i",
                    },
                },
                {
                    location: {
                        $regex: safeSearch,
                        $options: "i",
                    },
                },
            ];
        }

        // Pagination
        const pageNumber = Math.max(1, Number(page) || 1);

        const limitNumber = Math.min(
            50,
            Math.max(1, Number(limit) || 10)
        );

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

        const rooms = await roomModel
            .find(query)
            .populate("owner", "username")
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


// ===============================
// Get Single Room
// ===============================

export async function getSingleRoomDetailsController(req, res) {
    try {
        const { roomId } = req.params;

        const room = await roomModel
            .findById(roomId)
            .populate("owner", "username");

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


// ===============================
// Get My Rooms
// ===============================

export async function getMyRoomController(req, res) {
    try {
        const ownerId = req.user._id;

        const rooms = await roomModel
            .find({
                owner: ownerId,
            })
            .sort({ createdAt: -1 });

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


// ===============================
// Update Room
// ===============================

export async function updateRoomController(req, res) {
    const uploadedFileIds = [];
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

        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Ownership check
        if (
            room.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this room",
            });
        }

        // Handle new images upload if provided
        let newRoomImages = [];
        if (req.files && req.files.length > 0) {
            newRoomImages = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname,
                        folder: "rooms",
                    });
                    uploadedFileIds.push(result.fileId);
                    return {
                        url: result.url,
                        fileId: result.fileId,
                    };
                })
            );
        }

        // Validate max limit of 5 images
        if (room.images.length + newRoomImages.length > 5) {
            if (uploadedFileIds.length > 0) {
                await Promise.allSettled(
                    uploadedFileIds.map((fileId) => deleteFile(fileId))
                );
            }
            return res.status(400).json({
                success: false,
                message: "A room listing can have a maximum of 5 images",
            });
        }

        // Update only provided fields
        if (title !== undefined) {
            room.title = title.trim();
        }

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
                availability === true ||
                availability === "true";
        }

        if (newRoomImages.length > 0) {
            room.images.push(...newRoomImages);
        }

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Room updated successfully",
            room,
        });

    } catch (error) {
        console.error("Update Room Error:", error);

        // Cleanup newly uploaded ImageKit files if operation fails
        if (uploadedFileIds.length > 0) {
            await Promise.allSettled(
                uploadedFileIds.map((fileId) => deleteFile(fileId))
            );
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ===============================
// Delete Room
// ===============================

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
        if (
            room.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this room",
            });
        }

        // Delete ImageKit images
        if (room.images && room.images.length > 0) {
            await Promise.allSettled(
                room.images.map((image) =>
                    deleteFile(image.fileId)
                )
            );
        }

        // Delete MongoDB document
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


// ===============================
// Update Room Availability
// ===============================

export async function updateRoomAvailabilityController(req, res) {
    try {
        const { roomId } = req.params;
        const { availability } = req.body;

        if (typeof availability !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Availability must be true or false",
            });
        }

        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Ownership check
        if (
            room.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this room",
            });
        }

        room.availability = availability;

        await room.save();

        return res.status(200).json({
            success: true,
            message: availability
                ? "Room is now available"
                : "Room is now unavailable",
            room,
        });

    } catch (error) {
        console.error(
            "Update Room Availability Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// ===============================
// Delete Room Image
// ===============================

export async function deleteRoomImageController(req, res) {
    try {
        const { roomId, fileId } = req.params;

        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // Ownership check
        if (
            room.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to modify this room",
            });
        }

        // Find image
        const image = room.images.find(
            (img) => img.fileId === fileId
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found",
            });
        }

        // Delete ImageKit image
        await deleteFile(fileId);

        // Remove from MongoDB
        room.images = room.images.filter(
            (img) => img.fileId !== fileId
        );

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Room image deleted successfully",
            room,
        });

    } catch (error) {
        console.error(
            "Delete Room Image Error:",
            error
        );

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
    deleteRoomImageController,
};
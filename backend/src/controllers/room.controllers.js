import roomModel from "../models/room.model.js";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js"
//Create room controller

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

export async function getAllRoomsController(req,res) {
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

export default {
    createRoomController,
    getAllRoomsController
}
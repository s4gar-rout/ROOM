import UserModel from "../models/user.model.js";
import roomModel from '../models/room.model.js'
import { deleteFile } from "../services/storage.service.js";
import { createNotification } from "../services/notification.service.js";


// Block User
async function blockUserController(req, res) {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Admin ko khud block karne se prevent
        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin cannot be blocked",
            });
        }

        if (user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "User is already blocked",
            });
        }

        user.isBlocked = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User blocked successfully",
        });

    } catch (error) {
        console.error("Block User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Unblock User
async function unblockUserController(req, res) {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: "User is not blocked",
            });
        }

        user.isBlocked = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User unblocked successfully",
        });

    } catch (error) {
        console.error("Unblock User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Get All Users
async function getAllUsersController(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const query = search ? {
            $or: [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        } : {};

        const users = await UserModel.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await UserModel.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            users,
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Get All Rooms
async function getAllRoomsController(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const query = search ? {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ]
        } : {};

        const rooms = await roomModel
            .find(query)
            .populate("owner", "username email contact")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await roomModel.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: rooms.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            rooms,
        });

    } catch (error) {
        console.error("Get All Rooms Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// Delete Room - Admin
async function deleteRoomController(req, res) {
    try {
        const { roomId } = req.params;

        // 1. Find room
        const room = await roomModel.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        // 2. Delete images from ImageKit
        if (room.images && room.images.length > 0) {
            await Promise.all(
                room.images.map((image) =>
                    deleteFile(image.fileId)
                )
            );
        }

        // 3. Delete room from MongoDB
        await roomModel.findByIdAndDelete(roomId);

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });

    } catch (error) {
        console.error("Admin Delete Room Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Get Dashboard Stats
async function getDashboardStatsController(req, res) {
    try {
        const [
            totalUsers,
            totalOwners,
            totalTenants,
            totalRooms,
            availableRooms
        ] = await Promise.all([
            UserModel.countDocuments(),
            UserModel.countDocuments({ role: "owner" }),
            UserModel.countDocuments({ role: "tenant" }),
            roomModel.countDocuments(),
            roomModel.countDocuments({ availability: true }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                users: totalUsers,
                owners: totalOwners,
                tenants: totalTenants,
                rooms: totalRooms,
                availableRooms,
                unavailableRooms: totalRooms - availableRooms
            }
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


export default {
    unblockUserController,
    blockUserController,
    getAllUsersController,
    getAllRoomsController,
    deleteRoomController,
    getDashboardStatsController
}
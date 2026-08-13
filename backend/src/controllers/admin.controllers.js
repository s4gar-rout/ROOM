import UserModel from "../models/user.model.js";
import roomModel from '../models/room.model.js'
import { deleteFile } from "../services/storage.service.js";
import { createNotification } from "../services/notification.service.js";


// Request Owner Controller
async function requestOwnerController(req, res) {
    try {
        // 1. Find logged-in user
        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 2. Check pending request
        if (user.ownerRequestStatus === "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Owner request already pending"
            });
        }

        // 3. Create owner request
        user.ownerRequestStatus = "PENDING";

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Owner request submitted successfully"
        });

    } catch (error) {
        console.error("Request Owner Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Update Owner Request Controller
async function updateOwnerRequestController(req, res) {
    try {
        const { userId } = req.params;
        const { action } = req.body;

        // 1. Find user
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 2. Validate action
        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Action must be approve or reject",
            });
        }

        // 3. Check pending request
        if (user.ownerRequestStatus !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "No pending owner request",
            });
        }

        // ==========================================
        // APPROVE
        // ==========================================

        if (action === "approve") {
            user.role = "owner";
            user.ownerVerified = true;
            user.ownerRequestStatus = "APPROVED";

            await user.save();

            // Create notification for tenant
            await createNotification({
                userId: user._id,
                type: "OWNER_REQUEST_APPROVED",
                title: "Owner Request Approved",
                message:
                    "Your request to become an owner has been approved.",
                    io: req.app.get("io"),
            });
        }

        // ==========================================
        // REJECT
        // ==========================================

        if (action === "reject") {
            user.role = "tenant";
            user.ownerVerified = false;
            user.ownerRequestStatus = "REJECTED";

            await user.save();

            // Create notification for tenant
            await createNotification({
                userId: user._id,
                type: "OWNER_REQUEST_REJECTED",
                title: "Owner Request Rejected",
                message:
                    "Your request to become an owner has been rejected.",

                    io: req.app.get("io"),
            });
        }

        return res.status(200).json({
            success: true,
            message: `Owner request ${action}d successfully`,
        });

    } catch (error) {
        console.error("Update Owner Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
// Get Pending Owner Requests
async function getPendingOwnerRequestsController(req, res) {
    try {
        const users = await UserModel.find({
            role: "tenant",
            ownerRequestStatus: "PENDING",
        }).select("-password -otp -otpExpiresAt -otpCooldownExpiresAt");

        return res.status(200).json({
            success: true,
            count: users.length,
            requests: users,
        });

    } catch (error) {
        console.error("Get Pending Owner Requests Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

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
        const users = await UserModel.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
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
        const rooms = await roomModel
            .find()
            .populate("owner", "username email contact")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: rooms.length,
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
export default {
    requestOwnerController,
    updateOwnerRequestController,
    getPendingOwnerRequestsController,
    unblockUserController,
    blockUserController,
    getAllUsersController,
    getAllRoomsController,
    deleteRoomController
}
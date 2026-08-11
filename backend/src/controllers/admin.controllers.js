import UserModel from "../models/user.model.js";

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

        // 2. Only tenant can request owner
        if (user.role !== "tenant") {
            return res.status(400).json({
                success: false,
                message: "Only tenant can request owner role"
            });
        }

        // 3. Check pending request
        if (user.ownerRequestStatus === "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Owner request already pending"
            });
        }

        // 4. Create owner request
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

        // 1. Validate action
        if (!["approve", "reject"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        // 2. Find user
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Check pending request
        if (user.ownerRequestStatus !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "No pending owner request"
            });
        }

        // 4. Approve request
        if (action === "approve") {
            user.role = "owner";
            user.ownerVerified = true;
            user.ownerRequestStatus = "APPROVED";
        }

        // 5. Reject request
        if (action === "reject") {
            user.role = "tenant";
            user.ownerVerified = false;
            user.ownerRequestStatus = "REJECTED";
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: `Owner request ${action}d successfully`
        });

    } catch (error) {
        console.error("Update Owner Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export default {
    requestOwnerController,
    updateOwnerRequestController
}
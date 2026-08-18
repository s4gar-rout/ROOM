import FeedbackModel from "../models/feedback.model.js";

/**
 * @desc Create new feedback
 * @route POST /api/feedback
 * @access Public (Optional Auth)
 */
export const createFeedbackController = async (req, res) => {
    try {
        const { type, rating, message, email } = req.body;

        const feedbackData = {
            type,
            rating,
            message,
        };

        if (req.user) {
            feedbackData.user = req.user._id;
        } else if (email) {
            feedbackData.email = email;
        } else {
            return res.status(400).json({
                success: false,
                message: "Email is required for guest users",
            });
        }

        const feedback = await FeedbackModel.create(feedbackData);

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: feedback,
        });
    } catch (error) {
        console.error("Create feedback error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc Get all feedback (Admin)
 * @route GET /api/admin/feedback
 * @access Private/Admin
 */
export const getAllFeedbackController = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, rating } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (rating) {
            query.rating = Number(rating);
        }

        const feedback = await FeedbackModel.find(query)
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await FeedbackModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: feedback,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalFeedback: count,
        });
    } catch (error) {
        console.error("Get all feedback error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc Update feedback status (Admin)
 * @route PATCH /api/admin/feedback/:id/status
 * @access Private/Admin
 */
export const updateFeedbackStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const feedback = await FeedbackModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback status updated successfully",
            data: feedback,
        });
    } catch (error) {
        console.error("Update feedback status error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc Delete feedback (Admin)
 * @route DELETE /api/admin/feedback/:id
 * @access Private/Admin
 */
export const deleteFeedbackController = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await FeedbackModel.findByIdAndDelete(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully",
        });
    } catch (error) {
        console.error("Delete feedback error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

import IssueModel from "../models/issue.model.js";

/**
 * @desc Create a new issue report
 * @route POST /api/issues
 * @access Public (Optional Auth)
 */
export const createIssueController = async (req, res) => {
    try {
        const { type, subject, description, email, roomId } = req.body;

        const issueData = {
            type,
            subject,
            description,
        };

        if (req.user) {
            issueData.user = req.user._id;
        } else if (email) {
            issueData.email = email;
        } else {
            return res.status(400).json({
                success: false,
                message: "Email is required for guest users",
            });
        }

        if (roomId) {
            issueData.roomId = roomId;
        }

        const issue = await IssueModel.create(issueData);

        res.status(201).json({
            success: true,
            message: "Issue reported successfully",
            data: issue,
        });
    } catch (error) {
        console.error("Create issue error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc Get all issues (Admin)
 * @route GET /api/admin/issues
 * @access Private/Admin
 */
export const getAllIssuesController = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, search } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const issues = await IssueModel.find(query)
            .populate("user", "firstName lastName email")
            .populate("roomId", "title")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await IssueModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: issues,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalIssues: count,
        });
    } catch (error) {
        console.error("Get all issues error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc Update issue status (Admin)
 * @route PATCH /api/admin/issues/:id/status
 * @access Private/Admin
 */
export const updateIssueStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const issue = await IssueModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Issue status updated successfully",
            data: issue,
        });
    } catch (error) {
        console.error("Update issue status error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * @desc Delete issue (Admin)
 * @route DELETE /api/admin/issues/:id
 * @access Private/Admin
 */
export const deleteIssueController = async (req, res) => {
    try {
        const { id } = req.params;

        const issue = await IssueModel.findByIdAndDelete(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });
    } catch (error) {
        console.error("Delete issue error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

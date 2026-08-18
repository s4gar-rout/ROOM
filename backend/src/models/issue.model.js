import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        type: {
            type: String,
            required: [true, "Issue type is required"],
            enum: [
                "Technical Problem",
                "Room / Listing Problem",
                "User / Owner Problem",
                "Messaging Problem",
                "Account Problem",
                "Safety / Abuse",
                "Other",
            ],
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: [100, "Subject cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        },
        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
            default: "OPEN",
        },
    },
    {
        timestamps: true,
    }
);

const IssueModel = mongoose.model("Issue", issueSchema);

export default IssueModel;

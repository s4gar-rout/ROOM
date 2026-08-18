import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
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
            required: [true, "Feedback type is required"],
            enum: [
                "General Feedback",
                "Feature Request",
                "UI / Design",
                "Performance",
                "Suggestion",
                "Other",
            ],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1,
            max: 5,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },
        status: {
            type: String,
            enum: ["NEW", "REVIEWED"],
            default: "NEW",
        },
    },
    {
        timestamps: true,
    }
);

const FeedbackModel = mongoose.model("Feedback", feedbackSchema);

export default FeedbackModel;

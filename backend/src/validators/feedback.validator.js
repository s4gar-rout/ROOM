import { body, param } from "express-validator";

export const createFeedbackValidation = [
    body("type")
        .trim()
        .notEmpty()
        .withMessage("Feedback type is required")
        .isIn([
            "General Feedback",
            "Feature Request",
            "UI / Design",
            "Performance",
            "Suggestion",
            "Other",
        ])
        .withMessage("Invalid feedback type"),
    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be an integer between 1 and 5"),
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ max: 2000 })
        .withMessage("Message cannot exceed 2000 characters"),
    body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Valid email is required"),
];

export const updateFeedbackStatusValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid feedback ID"),
    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["NEW", "REVIEWED"])
        .withMessage("Invalid status"),
];

export const feedbackIdValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid feedback ID"),
];

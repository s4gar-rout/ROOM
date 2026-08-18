import { body, param, query } from "express-validator";

export const createIssueValidation = [
    body("type")
        .trim()
        .notEmpty()
        .withMessage("Issue type is required")
        .isIn([
            "Technical Problem",
            "Room / Listing Problem",
            "User / Owner Problem",
            "Messaging Problem",
            "Account Problem",
            "Safety / Abuse",
            "Other",
        ])
        .withMessage("Invalid issue type"),
    body("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required")
        .isLength({ max: 100 })
        .withMessage("Subject cannot exceed 100 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),
    body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Valid email is required"),
    body("roomId")
        .optional({ checkFalsy: true })
        .isMongoId()
        .withMessage("Invalid room ID"),
];

export const updateIssueStatusValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid issue ID"),
    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
        .withMessage("Invalid status"),
];

export const issueIdValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid issue ID"),
];

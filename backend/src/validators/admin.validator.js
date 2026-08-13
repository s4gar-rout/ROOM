import { param, body } from "express-validator";


// ===============================
// USER ID VALIDATION
// ===============================

export const userIdValidation = [
    param("userId")
        .isMongoId()
        .withMessage("Invalid user ID"),
];


// ===============================
// UPDATE OWNER REQUEST
// ===============================

export const updateOwnerRequestValidation = [
    body("action")
        .trim()
        .notEmpty()
        .withMessage("Action is required")
        .isIn(["approve", "reject"])
        .withMessage("Action must be approve or reject"),
];
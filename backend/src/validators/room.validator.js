import { body } from "express-validator";

export const createRoomValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Room title is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Room title must be between 3 and 100 characters"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Room description is required")
        .isLength({ min: 10, max: 1000 })
        .withMessage("Room description must be between 10 and 1000 characters"),

    body("rent")
        .notEmpty()
        .withMessage("Room rent is required")
        .isFloat({ min: 0 })
        .withMessage("Rent must be a valid non-negative number"),

    body("location")
        .trim()
        .notEmpty()
        .withMessage("Room location is required"),

    body("roomType")
        .isIn(["single", "double", "shared", "1BHK", "2BHK"])
        .withMessage("Invalid room type"),
];
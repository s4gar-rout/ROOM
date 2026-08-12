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
        .withMessage(
            "Room description must be between 10 and 1000 characters"
        ),

    body("rent")
        .notEmpty()
        .withMessage("Room rent is required")
        .isFloat({ min: 0 })
        .withMessage("Rent must be a valid non-negative number"),

    body("location")
        .trim()
        .notEmpty()
        .withMessage("Room location is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Location must be between 2 and 100 characters"),

    body("roomType")
        .notEmpty()
        .withMessage("Room type is required")
        .isIn(["single", "double", "shared", "1BHK", "2BHK"])
        .withMessage("Invalid room type"),

    body("facilities")
        .optional()
        .custom((value) => {
            let facilities = value;

            if (typeof facilities === "string") {
                try {
                    facilities = JSON.parse(facilities);
                } catch {
                    throw new Error(
                        "Facilities must be a valid JSON array"
                    );
                }
            }

            if (!Array.isArray(facilities)) {
                throw new Error("Facilities must be an array");
            }

            if (
                facilities.some(
                    (facility) =>
                        typeof facility !== "string" ||
                        !facility.trim()
                )
            ) {
                throw new Error(
                    "Each facility must be a non-empty string"
                );
            }

            return true;
        }),

    // Images
body("images").custom((_, { req }) => {
    if (!req.files || req.files.length === 0) {
        throw new Error("At least one room image is required");
    }

    return true;
}),
];
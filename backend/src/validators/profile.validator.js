import { body } from "express-validator";

// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfileValidation = [
    body("username")
        .optional()
        .trim()
        .isLength({
            min: 3,
            max: 30,
        })
        .withMessage(
            "Username must be between 3 and 30 characters"
        ),

    body("contact")
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage(
            "Contact must be a valid 10-digit number"
        ),

    body("role")
        .optional()
        .isIn(["user", "owner"])
        .withMessage(
            "Role must be either user or owner"
        ),
];


// ==========================================
// CHANGE PASSWORD
// ==========================================

export const changePasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage(
            "Current password is required"
        ),

    body("newPassword")
        .notEmpty()
        .withMessage(
            "New password is required"
        )
        .isLength({
            min: 8,
            max: 100,
        })
        .withMessage(
            "New password must be between 8 and 100 characters"
        ),
];


// ==========================================
// AVATAR
// ==========================================

export const avatarValidation = [
    body().custom((_, { req }) => {
        if (!req.file) {
            throw new Error(
                "Profile photo is required"
            );
        }

        return true;
    }),
];
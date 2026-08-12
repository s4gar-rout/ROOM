import multer from "multer";

export function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Each image must be less than 5MB",
            });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 images are allowed",
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    // fileFilter error
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
}
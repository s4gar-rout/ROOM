import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Allowed image types
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/avif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPEG, PNG, WEBP and AVIF images are allowed"
            ),
            false
        );
    }
};

const upload = multer({
    storage,

    // Maximum 5MB per image
    limits: {
        fileSize: 5 * 1024 * 1024,
    },

    fileFilter,
});

export default upload;
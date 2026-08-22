import multer from "multer";

/**
 * Centralized Express Error Handling Middleware.
 * Catches all errors, logs details securely on the server,
 * and delivers friendly, sanitized responses to the client.
 */
export function errorHandler(err, req, res, next) {
    // 1. Log detailed error on the server
    console.error(`[${new Date().toISOString()}] Internal Error on ${req.method} ${req.originalUrl}:`, err);

    // 2. Default status & message
    let statusCode = err.statusCode || err.status || 500;
    let message = "Something went wrong on our side. Please try again later.";

    // 3. Handle specific operational / library errors
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "Each image must be less than 5MB";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Maximum 5 images are allowed";
        } else {
            message = "File upload failed. Please check file format and size.";
        }
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = "The requested item or format could not be found";
    } else if (err.code === 11000) {
        statusCode = 409;
        message = "An entry with these details already exists";
    } else if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Please check the information provided";
    } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Your session has expired. Please log in again";
    } else if (err.isOperational && err.message) {
        message = err.message;
    }

    // 4. Send safe JSON response (never expose stack traces in production)
    return res.status(statusCode).json({
        success: false,
        message,
    });
}

export default errorHandler;

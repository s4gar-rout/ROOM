import redis from "../services/redis.service.js";

export function rateLimiter({
    keyPrefix,
    limit,
    windowInSeconds,
}) {
    return async (req, res, next) => {
        try {
            // User ki IP identify karo
            const ip =
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress;

            const key = `rate-limit:${keyPrefix}:${ip}`;

            // Current request count increase
            const count = await redis.incr(key);

            // First request par TTL set karo
            if (count === 1) {
                await redis.expire(key, windowInSeconds);
            }

            // Limit exceed
            if (count > limit) {
                const ttl = await redis.ttl(key);

                return res.status(429).json({
                    success: false,
                    message: "Too many requests. Please try again later.",
                    retryAfter: ttl,
                });
            }

            // Remaining requests
            res.setHeader(
                "X-RateLimit-Limit",
                limit
            );

            res.setHeader(
                "X-RateLimit-Remaining",
                Math.max(0, limit - count)
            );

            next();

        } catch (error) {
            console.error(
                "Rate Limiter Error:",
                error
            );

            // Redis down hone par API ko unnecessarily block
            // nahi karenge.
            next();
        }
    };
}
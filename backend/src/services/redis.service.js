import { Redis } from "@upstash/redis";
import { config } from "../config/config.js";

const redis = new Redis({
    url: config.UPSTASH_REDIS_REST_URL,
    token: config.UPSTASH_REDIS_REST_TOKEN,
});

export async function testRedisConnection() {
    try {
        const response = await redis.set("roomsetu:test", "connected");

        const value = await redis.get("roomsetu:test");

        console.log("=================================");
        console.log("Redis Connection: SUCCESS ✅");
        console.log("Redis SET:", response);
        console.log("Redis GET:", value);
        console.log("=================================");

    } catch (error) {
        console.error("=================================");
        console.error("Redis Connection: FAILED ❌");
        console.error("Error:", error.message);
        console.error("=================================");
    }
}

export default redis;
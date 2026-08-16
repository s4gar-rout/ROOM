import dotenv from 'dotenv'
dotenv.config()

if (!process.env.PORT) {
    throw new Error("PORT is not defined in enviroment varriables")
}

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in enviroment varriables")
}

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in enviroment varriables")
}

if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in enviroment varriables")
}

if (!process.env.ACCESS_TOKEN_EXPIRES_IN) {
    throw new Error("ACCESS_TOKEN_EXPIRE_IN is not defined in enviroment varriables")
}

if (!process.env.REFRESH_TOKEN_EXPIRES_IN) {
    throw new Error("REFRESH_TOKEN_EXPIRE_IN is not defined in enviroment varriables")
}

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_CONTACT) {
    throw new Error("Admin credentials are not defined in enviroment varriables")
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("Imagekit private key is not defined in enviroment varriables")
}

if (!process.env.BREVO_API_KEY) {
    throw new Error(
        "BREVO_API_KEY is not defined in environment variables"
    );
}

if (!process.env.BREVO_EMAIL) {
    throw new Error(
        "BREVO_EMAIL is not defined in environment variables"
    );
}

if (!process.env.UPSTASH_REDIS_REST_URL) {
    throw new Error(
        "UPSTASH_REDIS_REST_URL is not defined in environment variables"
    );
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
        "UPSTASH_REDIS_REST_TOKEN is not defined in environment variables"
    );
}

if(!process.env.FRONTEND_URL){
    throw new Error(
        "FRONTEND_URL is not defined in environment variables"
    )
}

export const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_CONTACT: process.env.ADMIN_CONTACT,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_EMAIL: process.env.BREVO_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV || "development",
}
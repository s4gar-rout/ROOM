import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { config } from "../config/config.js";
import connectToDB from "../config/db.js";
import UserModel from "../models/user.model.js";

const createAdmin = async () => {
    try {
        await connectToDB();

        const existingAdmin = await UserModel.findOne({
            email: config.ADMIN_EMAIL,
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const admin = await UserModel.create({
            username: config.ADMIN_USERNAME,
            email: config.ADMIN_EMAIL,
            password: config.ADMIN_PASSWORD,
            contact: config.ADMIN_CONTACT,
            role: "admin",
            ownerVerified: true,
            authProvider: "local",
        });

        console.log("Admin created successfully");
        console.log("Admin Email:", admin.email);

        process.exit(0);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exit(1);
    }
};

createAdmin();
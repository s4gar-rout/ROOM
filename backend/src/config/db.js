import mongoose from 'mongoose'
import { config } from './config.js'


const connectToDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 10000,
        })
        console.log('Connected to Database')
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        throw err;
    }
}

export default connectToDB
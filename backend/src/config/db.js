import mongoose from 'mongoose'
import { config } from './config.js'

const connectToDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log('Connected to Database')
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
    }
}

export default connectToDB
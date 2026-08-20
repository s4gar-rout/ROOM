import mongoose from 'mongoose'
import { config } from './config.js'


const connectToDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 10000,
        })
        console.log('Connected to Database')
        
        // Clean up legacy index from conversations collection
        const db = mongoose.connection.db;
        try {
            const collections = await db.listCollections({ name: 'conversations' }).toArray();
            if (collections.length > 0) {
                const indexes = await db.collection('conversations').indexes();
                const hasLegacyIndex = indexes.some(idx => idx.name === 'room_1_owner_1_user_1');
                if (hasLegacyIndex) {
                    await db.collection('conversations').dropIndex('room_1_owner_1_user_1');
                    console.log('Legacy room_1_owner_1_user_1 index dropped successfully.');
                }
            }
        } catch (idxErr) {
            console.error('Failed to clean up legacy indexes:', idxErr.message);
        }
        
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        throw err;
    }
}

export default connectToDB
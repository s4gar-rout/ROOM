import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    try {
        const indexes = await db.collection('conversations').indexes();
        console.log('Current Indexes on conversations:');
        indexes.forEach(idx => console.log(idx.name));
        
        // Find the rogue index
        const hasLegacyIndex = indexes.some(idx => idx.name === 'room_1_owner_1_user_1');
        
        if (hasLegacyIndex) {
            console.log('Found legacy index: room_1_owner_1_user_1. Dropping it...');
            await db.collection('conversations').dropIndex('room_1_owner_1_user_1');
            console.log('Legacy index dropped successfully.');
        } else {
            console.log('Legacy index not found.');
        }
        
        // Also fix the missing unique index on buyer if needed (Mongoose usually handles this on startup)
    } catch (err) {
        console.error('Error fixing indexes:', err);
    } finally {
        mongoose.disconnect();
    }
});

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const indexes = await db.collection('users').indexes();
    console.log('Indexes:');
    indexes.forEach(idx => console.log(idx));
    
    const duplicates = await db.collection('users').aggregate([
        { $match: { contact: { $ne: null, $exists: true, $ne: '' } } },
        { $group: { _id: '$contact', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]).toArray();
    console.log('Duplicates:', duplicates);
    
    // Clean up duplicates by unsetting contact for older ones
    for (const dup of duplicates) {
        const contact = dup._id;
        const users = await db.collection('users').find({ contact }).sort({ createdAt: -1 }).toArray();
        // Keep the first (newest), unset for the rest
        for (let i = 1; i < users.length; i++) {
            await db.collection('users').updateOne({ _id: users[i]._id }, { $unset: { contact: "" } });
            console.log(`Unset contact for duplicate user ${users[i]._id}`);
        }
    }
    
    // Recreate the index
    try {
        await db.collection('users').dropIndex("contact_1");
    } catch(e) {}
    
    await db.collection('users').createIndex({ contact: 1 }, { unique: true, sparse: true });
    console.log('Index created successfully.');

    process.exit(0);
}).catch(console.error);

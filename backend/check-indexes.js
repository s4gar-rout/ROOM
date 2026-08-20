import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/room', { family: 4 }).then(async () => {
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
    
    process.exit(0);
}).catch(console.error);

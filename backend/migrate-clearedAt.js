import "dotenv/config";
import mongoose from "mongoose";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  
  const db = mongoose.connection.db;
  const collection = db.collection("conversations");
  
  const conversations = await collection.find({ "clearedAt": { $type: "array" } }).toArray();
  console.log(`Found ${conversations.length} conversations to migrate`);
  
  let count = 0;
  for (const conv of conversations) {
    const newClearedAt = {};
    if (Array.isArray(conv.clearedAt)) {
      for (const item of conv.clearedAt) {
        if (item.user && item.clearedAt) {
          newClearedAt[item.user.toString()] = item.clearedAt;
        }
      }
    }
    
    await collection.updateOne(
      { _id: conv._id },
      { $set: { clearedAt: newClearedAt } }
    );
    count++;
  }
  
  console.log(`Migrated ${count} conversations.`);
  process.exit(0);
}

run().catch(console.error);

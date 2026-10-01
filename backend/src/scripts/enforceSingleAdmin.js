import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/nextstep-ai';
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nextstep.ai').trim().toLowerCase();

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Make sure admin exists and is admin
  const adminUser = await User.findOne({ email: adminEmail });
  if (adminUser) {
    adminUser.role = 'admin';
    await adminUser.save();
    console.log(`Verified master admin: ${adminEmail}`);
  }

  // Update all other users to student
  const result = await User.updateMany(
    { email: { $ne: adminEmail } },
    { $set: { role: 'student' } }
  );
  console.log(`Updated non-admin users to student: ${result.modifiedCount}`);

  const allUsers = await User.find({}, 'name email role').lean();
  console.log('Current users:', allUsers);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

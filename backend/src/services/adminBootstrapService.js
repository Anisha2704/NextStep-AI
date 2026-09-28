import User from '../models/User.js';

const bootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'NextStep Admin';

  if (!email && !password) {
    console.log('Admin bootstrap skipped: ADMIN_EMAIL and ADMIN_PASSWORD are not configured.');
    return;
  }
  if (!email || !password || password.length < 12) {
    throw new Error('Configure both ADMIN_EMAIL and ADMIN_PASSWORD; the admin password must be at least 12 characters.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== 'admin') {
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`Configured admin access for ${email}.`);
    } else {
      console.log(`Configured admin account is ready: ${email}.`);
    }
    return;
  }

  await User.create({ name, email, password, role: 'admin' });
  console.log(`Initial admin account created: ${email}.`);
};

export default bootstrapAdmin;

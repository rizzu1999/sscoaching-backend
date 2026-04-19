/**
 * Run once to create the first admin user:
 *   node src/seed/createAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const exists = await User.findOne({ email: 'admin@sscoaching.com' });
  if (exists) { console.log('Admin already exists'); process.exit(0); }

  await User.create({
    name: 'SS Admin',
    email: 'admin@sscoaching.com',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('✅ Admin created!');
  console.log('   Email:    admin@sscoaching.com');
  console.log('   Password: Admin@123');
  console.log('   ⚠️  Change the password after first login!');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

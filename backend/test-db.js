import { connectDB } from './db/connectDB.js';
import { User } from './models/user.model.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    console.log('Testing user query...');
    const userCount = await User.countDocuments();
    console.log(`✅ Found ${userCount} users in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

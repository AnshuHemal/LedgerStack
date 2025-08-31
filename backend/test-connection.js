import { connectDB, isDBReady, getConnectionStatus } from './db/connectDB.js';
import { User } from './models/user.model.js';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Initial status:', getConnectionStatus());
    
    const startTime = Date.now();
    await connectDB();
    const connectionTime = Date.now() - startTime;
    
    console.log('✅ Database connection successful!');
    console.log('Connection time:', connectionTime + 'ms');
    console.log('Final status:', getConnectionStatus());
    
    // Test a simple query
    console.log('🔍 Testing user query...');
    const queryStartTime = Date.now();
    const userCount = await User.countDocuments().maxTimeMS(5000);
    const queryTime = Date.now() - queryStartTime;
    
    console.log(`✅ Found ${userCount} users in database`);
    console.log('Query time:', queryTime + 'ms');
    
    // Test connection readiness
    console.log('🔍 Testing connection readiness...');
    console.log('Is DB ready:', isDBReady());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    console.log('Final status:', getConnectionStatus());
    process.exit(1);
  }
}

testConnection();

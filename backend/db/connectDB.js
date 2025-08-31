import mongoose from "mongoose";

// Connection state
let isConnected = false;
let connectionPromise = null;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const connectDB = async (retryCount = 0) => {
  // If already connected, return the connection
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If there's an ongoing connection attempt, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create new connection promise
  connectionPromise = (async () => {
    try {
      // Close any existing connections first
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      const mongoUri = process.env.MONGODB_URI || "mongodb+srv://whiteturtle1:dvIw4evFuDVOzea3@cluster0.1e4vx.mongodb.net/ledgerstack?retryWrites=true&w=majority&appName=Cluster0";
      
      const options = {
        bufferCommands: false,
        maxPoolSize: 1, // Reduce pool size for serverless
        serverSelectionTimeoutMS: 3000, // Reduce timeout
        socketTimeoutMS: 30000, // Reduce socket timeout
        family: 4, // Use IPv4
        retryWrites: true,
        w: 'majority',
        // Add connection string options
        connectTimeoutMS: 3000,
        heartbeatFrequencyMS: 10000,
        maxIdleTimeMS: 30000,
        // Disable features that cause issues in serverless
        autoIndex: false,
        autoCreate: false
      };

      console.log(`Connecting to MongoDB... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
      
      await mongoose.connect(mongoUri, options);
      
      isConnected = true;
      console.log("MongoDB connected successfully");
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        isConnected = false;
        connectionPromise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        isConnected = false;
        connectionPromise = null;
      });

      return mongoose.connection;
      
    } catch (error) {
      console.error(`Failed to connect to MongoDB (attempt ${retryCount + 1}):`, error.message);
      
      // Reset connection state
      isConnected = false;
      connectionPromise = null;
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        return connectDB(retryCount + 1);
      }
      
      throw error;
    }
  })();

  return connectionPromise;
};

// Function to check if database is ready
export const isDBReady = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

// Function to get connection status
export const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
  };
};
import mongoose from "mongoose";

// Global variable to cache the connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    };

    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://whiteturtle1:dvIw4evFuDVOzea3@cluster0.1e4vx.mongodb.net/ledgerstack?retryWrites=true&w=majority&appName=Cluster0";
    
    cached.promise = mongoose.connect(mongoUri, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (cached.conn) {
    await cached.conn.disconnect();
    console.log('MongoDB disconnected through app termination');
    process.exit(0);
  }
});
import mongoose from "mongoose";

export const connectDB = async() => {
  try {
    const connection = await mongoose.connect("mongodb+srv://whiteturtle1:dvIw4evFuDVOzea3@cluster0.1e4vx.mongodb.net/ledgerstack?retryWrites=true&w=majority&appName=Cluster0")
    console.log(`Server connected to Database..`)
  } catch (error) {
    console.log(`Error connecting to database: ${error.message}`)
    process.exit(1)
  }
}
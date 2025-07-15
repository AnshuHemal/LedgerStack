import mongoose from "mongoose";

export const connectDB = async() => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL)
    console.log(`Server connected to Database..`)
  } catch (error) {
    console.log(`Error connecting to database: ${error.message}`)
    process.exit(1)
  }
}
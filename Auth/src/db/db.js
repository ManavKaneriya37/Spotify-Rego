import mongoose from "mongoose";
import config from "../config/config.js";

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to the database successfully");
  } catch (error) {
    throw new Error(`Error connecting to the database: ${error.message}`);
  }
}

export default connectDB;

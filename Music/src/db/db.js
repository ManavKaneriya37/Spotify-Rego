import mongoose from "mongoose";
import config from "../config/config.js"


async function connectDB() {
    try {
        const conn = await mongoose.connect(`${config.MONGO_URI}`)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error("MongoDB connection failed:", error)
    }
}

export default connectDB;
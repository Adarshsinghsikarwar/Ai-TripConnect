import mongoose from "mongoose";
import { mongoUri } from "../config/env.js";
import logger from "../utils/logger.js";

async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

export default connectDB;
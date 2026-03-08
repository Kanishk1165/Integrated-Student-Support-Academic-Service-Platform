const mongoose = require("mongoose");

// Fail fast instead of buffering model operations when DB is unavailable.
mongoose.set("bufferCommands", false);

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    if (isDatabaseConnected()) return mongoose.connection;

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = connectDB;
module.exports.isDatabaseConnected = isDatabaseConnected;

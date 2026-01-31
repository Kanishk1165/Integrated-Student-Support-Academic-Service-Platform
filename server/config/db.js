/**
 * MongoDB Database Connection Configuration
 * UniSupport Portal Backend
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // Check if MONGO_URI is configured
        if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string') {
            console.log('⚠️  MongoDB URI not configured. Please set MONGO_URI in .env file');
            console.log('   Example: MONGO_URI=mongodb://localhost:27017/unisupport_portal');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('⚠️  Server will continue running without database connection');
        console.log('   Please check your MONGO_URI in .env file');
    }
};

module.exports = connectDB;

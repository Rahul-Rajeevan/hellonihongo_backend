// config/db.js
const mongoose = require('mongoose'); // or import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if MONGODB_URI is loaded from .env
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables.');
        }

        // Connect to MongoDB using the URI from .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`); // Success message
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit with failure if connection fails
    }
};

module.exports = connectDB; // or export default connectDB;
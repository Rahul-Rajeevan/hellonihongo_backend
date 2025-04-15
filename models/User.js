// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 1. Define the Schema
const userSchema = new mongoose.Schema({
    // Define fields, types, and validation
    name: {
        type: String,
        required: [true, 'Please provide a name'] // Example: Name is required
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true, // No two users can have the same email
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't send password back in queries by default
    },
    role: { // Example: Adding a role field
        type: String,
        enum: ['user'], // Only allows 'user' or 'admin'
        default: 'user' // Default value if not provided
    }
}, {
    timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});


const User = mongoose.model('User', userSchema);

module.exports = User;
import express from 'express';
import bcrypt from 'bcrypt'; // Import bcrypt here
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import User from '../models/User.js'; // Make sure path is correct

export const authRouter = express.Router();

// --- SIGNUP Route ---
authRouter.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send("Please provide name, email, and password");
    }
     // Add password length check here if desired (though schema has minlength)
     if (password.length < 6) {
         return res.status(400).send("Password must be at least 6 characters long");
     }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).send("Email already registered");
        }

        // --- Hash password directly here ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user instance with the hashed password
        const newUser = new User({
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword, // Store the hashed password
            // 'role' will default to 'user'
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Respond upon successful signup (usually don't send token on signup)
        res.status(201).json({
            message: "Signup Successful",
            user: { // Send back some user info (never the password)
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                createdAt: savedUser.createdAt
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).send(`Validation Failed: ${messages.join(', ')}`);
        }
        if (error.code === 11000) {
             return res.status(409).send("Email already registered.");
        }
        res.status(500).send("Error processing signup");
    }
});

// --- LOGIN Route ---
authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Please provide email and password");
    }

    try {
        // Find user by email, ensure password field is retrieved
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists
        if (!user) {
            return res.status(401).send("Invalid email or password"); // 401 Unauthorized
        }

        // --- Compare password directly here ---
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send("Invalid email or password"); // 401 Unauthorized
        }

        // Create JWT Payload
        const payload = {
            id: user._id, // Include user ID in the token
            email: user.email,
            name: user.name,
            role: user.role
        };

        // Sign the token
        // Make sure JWT_SECRET is in your .env file!
        if (!process.env.JWT_SECRET) {
             console.error("FATAL ERROR: JWT_SECRET is not defined.");
             // In production, you might throw an error or handle differently
             return res.status(500).send('Internal Server Error: JWT configuration missing.');
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour (adjust as needed)
            // Other options: '1d', '7d', etc.
        );

        // Send the token and user info back to the client
        res.status(200).json({
            message: "Login Successful",
            token: token, // Send the generated token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Login error");
    }
});

// Export router (ensure this matches your project's module system)
// module.exports = authRouter; // If using CommonJS
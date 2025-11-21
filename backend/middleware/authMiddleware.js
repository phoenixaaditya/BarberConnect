const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes (check if user is logged in)
const protect = async (req, res, next) => {
    let token;

    // Check if the request has an authorization header with a token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get the token from the header (e.g., "Bearer eyJhbGci...")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user in the database using the ID from the token
            // We attach this user to the request object so our controllers can use it
            req.user = await User.findById(decoded.id).select('-password');

            // 4. Move on to the next function (the actual controller)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
    // This middleware should run AFTER the 'protect' middleware
    // because it relies on req.user being set.
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };

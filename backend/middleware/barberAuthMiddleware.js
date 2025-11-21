const jwt = require('jsonwebtoken');
const Barber = require('../models/barberModel');

// Middleware to protect barber routes
const protectBarber = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get the logged-in barber from the token's ID
            //    and attach the barber object to the request. We exclude the password.
            req.barber = await Barber.findById(decoded.id).select('-password');

            // 4. Proceed to the next step (the controller function)
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protectBarber };

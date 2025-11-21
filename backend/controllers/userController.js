// This is our controller function for registering a new user.
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    // 1. We "destructure" the name, email, and password from the request body.
    const { name, email, password } = req.body;
    if(!name || !email || !password){
        res.status(400).json({message: 'Please add all fields'});
        return;
    }

    const userExists = await User.findOne({email});
    if (userExists){
        res.status(400).json({message: 'User already exists'});
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email, 
        password: hashedPassword
    });

    if(user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
        });
    }
    else{
        res.status(400).json({message: 'Invalid user data'});
    }
};

const loginUser = async (req, res) => {
    const {email, password} = req.body;
    
    const user = await User.findOne({email});
    if(user && (await bcrypt.compare(password, user.password))){
        res.json ({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    }
    else{
        res.status(400).json({message: 'Invalid credentials'});
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // First check: Is there a user and is the password correct?
        if (user && (await bcrypt.compare(password, user.password))) {
            
            // Second, CRITICAL check: Is the user an admin?
            if (user.role !== 'admin') {
                // If they are not an admin, deny access. 403 means "Forbidden".
                return res.status(403).json({ message: 'Not authorized as an admin' });
            }

            // If all checks pass, send back the user info and a token.
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });

        } else {
            // If the user doesn't exist or password is wrong, send a general error.
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const generateToken = (id) => {
    // jwt.sign creates the token. It takes the data to sign (the user's ID),
    // a secret key from our .env file, and an expiration time.
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // The token will be valid for 30 days
    });
};
// We export the function so our routes file can use it.
module.exports = {
    registerUser,
    loginUser,
    adminLogin, 
};


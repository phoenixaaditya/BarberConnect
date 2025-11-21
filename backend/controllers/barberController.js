const Barber = require('../models/barberModel');
const Service = require('../models/serviceModel'); 
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import JWT for token generation

// --- Helper function to generate a JWT ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token will be valid for 30 days
    });
};

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });
// --- End of Multer Configuration ---

// @desc    Register a new barber
// @route   POST /api/barbers/register
// @access  Public
const registerBarber = async (req, res) => {
    try {
        const { ownerName, email, password, shopName, shopAddress, phone, tradeLicenseNumber, gstNumber, shopCategory } = req.body;
        
        // Check if image uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Trade license image is required.' });
        }
        const tradeLicenseImage = req.file.path.replace(/\\/g, '/');

        // Validate required fields
        if (!ownerName || !email || !password || !shopName || !shopAddress || !phone || !tradeLicenseNumber || !shopCategory) {
            return res.status(400).json({ success: false, message: 'Please fill out all required fields.' });
        }

        // Check duplicate email
        const barberExists = await Barber.findOne({ email });
        if (barberExists) {
            return res.status(400).json({ success: false, message: 'A barber with this email already exists.' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new barber
        const barber = await Barber.create({
            ownerName,
            email,
            password: hashedPassword,
            shopName,
            shopAddress,
            phone,
            tradeLicenseNumber,
            gstNumber,
            shopCategory,
            tradeLicenseImage,
            status: 'pending', // default until admin approves
        });

        if (barber) {
            res.status(201).json({
                success: true,
                message: 'Registration successful! Your application is under review.',
                barberId: barber._id,  // ✅ send ID back
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid barber data' });
        }
    } catch (error) {
        console.error('Server Error in registerBarber:', error);
        res.status(500).json({ success: false, message: 'Server Error occurred during registration.' });
    }
};

// NEW: @desc    Authenticate a barber & get token
// NEW: @route   POST /api/barbers/login
// NEW: @access  Public
const loginBarber = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the barber by email
        const barber = await Barber.findOne({ email });

        // 2. Check if barber exists and if the password matches
        if (barber && (await bcrypt.compare(password, barber.password))) {
            
            // 3. CRITICAL: Check if the barber's account has been approved by an admin
            if (barber.status !== 'approved') {
                return res.status(403).json({ success: false, message: 'Your account is not yet approved. Please wait for admin verification.' });
            }

            // 4. If all checks pass, send back the barber's data and a token
            res.status(200).json({
                success: true,
                _id: barber._id,
                shopName: barber.shopName,
                email: barber.email,
                token: generateToken(barber._id),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Server Error in loginBarber:', error);
        res.status(500).json({ success: false, message: 'Server Error occurred during login.' });
    }
};

const getApprovedBarbers = async (req, res) => {
    try {
        // Find all barbers in the database where the 'status' is 'approved'
        const barbers = await Barber.find({ status: 'approved' });
        res.status(200).json({ success: true, barbers });
    } catch (error) {
        console.error('Error fetching approved barbers:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
const getBarberProfile = async (req, res) => {
    try {
        // Find the barber by the ID from the URL
        const barber = await Barber.findById(req.params.id).select('-password'); // Exclude sensitive data
        
        if (!barber || barber.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Barber not found or not approved.' });
        }

        // Find all services associated with this barber's ID
        const services = await Service.find({ barber: req.params.id });

        res.status(200).json({
            success: true,
            barber,
            services,
        });

    } catch (error) {
        console.error('Error fetching barber profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    registerBarber,
    loginBarber,
    getApprovedBarbers,
    getBarberProfile, // Export the new function
    upload,
};


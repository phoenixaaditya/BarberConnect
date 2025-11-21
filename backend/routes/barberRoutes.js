const express = require('express');
const router = express.Router();
// IMPORTANT: We need to import BOTH the controller function AND the upload middleware
const { 
    registerBarber, 
    loginBarber, 
    getApprovedBarbers, 
    getBarberProfile, // The new function
    upload 
} = require('../controllers/barberController');

// This creates the final, correct registration route: /api/barbers/register
// 1. The path is now '/register'
// 2. We put `upload.single('tradeLicenseImage')` in the middle. This tells Express
//    to handle the file upload BEFORE running the registerBarber function.
router.post('/register', upload.single('tradeLicenseImage'), registerBarber);
router.post('/login', loginBarber);
router.get('/', getApprovedBarbers);
router.get('/:id', getBarberProfile);

module.exports = router;


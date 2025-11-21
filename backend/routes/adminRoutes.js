const express = require('express');
const router = express.Router();
const { getPendingBarbers, updateBarberStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/pending-barbers
// This route is protected, only an admin can access it.
router.get('/pending-barbers', protect, admin, getPendingBarbers);

// NEW: @route PUT /api/admin/barbers/:id
// This route will be used to approve or reject a barber.
// It is also protected to ensure only an admin can perform this action.
router.put('/barbers/:id', protect, admin, updateBarberStatus);

module.exports = router;


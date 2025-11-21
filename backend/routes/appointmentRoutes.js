const express = require('express');
const router = express.Router();
const { createAppointment, getBarberAppointments } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware'); // Security for regular customers
const { protectBarber } = require('../middleware/barberAuthMiddleware'); // Security for barbers

// @route   POST /api/appointments
// This route is for a CUSTOMER to create a new appointment.
// We use the 'protect' middleware to ensure only a logged-in customer can book.
router.post('/', protect, createAppointment);

// @route   GET /api/appointments/barber
// This route is for a BARBER to get their own appointments.
// We use the 'protectBarber' middleware to ensure only a logged-in barber can access their schedule.
router.get('/barber', protectBarber, getBarberAppointments);

module.exports = router;

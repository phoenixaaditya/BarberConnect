const Appointment = require('../models/appointmentModel');
const Barber = require('../models/barberModel');
const User = require('../models/userModel');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Customer
const createAppointment = async (req, res) => {
    try {
        // Get data from the request body
        const { barber, services, dateTime, totalPrice, totalDuration } = req.body;

        // req.user is available because of our 'protect' middleware for customers
        const customer = req.user._id;

        if (!barber || !services || !dateTime || !totalPrice || !totalDuration) {
            return res.status(400).json({ success: false, message: 'Please provide all required appointment details.' });
        }

        const newAppointment = await Appointment.create({
            customer,
            barber,
            services,
            dateTime,
            totalPrice,
            totalDuration,
        });

        res.status(201).json({ success: true, appointment: newAppointment });

    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get appointments for a logged-in barber for a specific day
// @route   GET /api/appointments/barber
// @access  Private/Barber
const getBarberAppointments = async (req, res) => {
    try {
        // req.barber is available because of our 'protectBarber' middleware
        const barberId = req.barber._id;
        
        // Get the date from the query string (e.g., /api/appointments/barber?date=2025-09-25)
        const requestedDate = req.query.date ? new Date(req.query.date) : new Date();
        
        // Set up the start and end of the requested day for accurate querying
        const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

        const appointments = await Appointment.find({
            barber: barberId,
            dateTime: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        })
        .populate('customer', 'name') // Replace customer ID with their name
        .populate('services', 'name price') // Replace service IDs with their name and price
        .sort({ dateTime: 'asc' }); // Show earliest appointments first

        res.status(200).json({ success: true, appointments });

    } catch (error) {
        console.error("Error fetching barber appointments:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    createAppointment,
    getBarberAppointments,
};

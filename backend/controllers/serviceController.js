const Service = require('../models/serviceModel');
const Barber = require('../models/barberModel');

// @desc    Get all services for a logged-in barber
// @route   GET /api/services
// @access  Private/Barber
const getServices = async (req, res) => {
    try {
        // We can access req.barber because our protectBarber middleware set it.
        const services = await Service.find({ barber: req.barber._id });
        res.status(200).json({ success: true, services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new service for a logged-in barber
// @route   POST /api/services
// @access  Private/Barber
const createService = async (req, res) => {
    try {
        const { name, price, duration } = req.body;

        if (!name || !price || !duration) {
            return res.status(400).json({ success: false, message: 'Please provide name, price, and duration' });
        }

        const service = await Service.create({
            name,
            price,
            duration,
            barber: req.barber._id, // Link the service to the logged-in barber
        });

        res.status(201).json({ success: true, service });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// NEW: @desc    Update a service
// NEW: @route   PUT /api/services/:id
// NEW: @access  Private/Barber
const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Ensure the logged-in barber owns this service
        if (service.barber.toString() !== req.barber._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const { name, price, duration } = req.body;
        service.name = name || service.name;
        service.price = price || service.price;
        service.duration = duration || service.duration;

        const updatedService = await service.save();
        res.status(200).json({ success: true, service: updatedService });

    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// NEW: @desc    Delete a service
// NEW: @route   DELETE /api/services/:id
// NEW: @access  Private/Barber
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Ensure the logged-in barber owns this service
        if (service.barber.toString() !== req.barber._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await service.deleteOne();
        res.status(200).json({ success: true, message: 'Service removed' });

    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getServices,
    createService,
    updateService, // Export the new functions
    deleteService,
};


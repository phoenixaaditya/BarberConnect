const Barber = require('../models/barberModel');

// @desc    Get all pending barber applications
// @route   GET /api/admin/pending-barbers
// @access  Private/Admin
const getPendingBarbers = async (req, res) => {
    try {
        // Use the Barber model to find all documents where the 'status' field is 'pending'
        const pendingBarbers = await Barber.find({ status: 'pending' });
        
        // Send the list of barbers back as a JSON response
        res.status(200).json(pendingBarbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// NEW: Function to approve or reject a barber
// @desc    Update a barber's status
// @route   PUT /api/admin/barbers/:id
// @access  Private/Admin
const updateBarberStatus = async (req, res) => {
    try {
        // Find the barber in the database using the ID from the URL parameter
        const barber = await Barber.findById(req.params.id);

        if (barber) {
            // Get the new status from the request body (e.g., 'approved' or 'rejected')
            const { status } = req.body;

            // Update the barber's status
            barber.status = status;
            
            // Save the updated barber back to the database
            const updatedBarber = await barber.save();
            
            // Send a success response
            res.status(200).json({ message: `Barber ${status}`, barber: updatedBarber });
        } else {
            res.status(404).json({ message: 'Barber not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    getPendingBarbers,
    updateBarberStatus, // Export the new function
};


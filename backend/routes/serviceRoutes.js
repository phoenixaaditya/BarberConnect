const express = require('express');
const router = express.Router();
// IMPORTANT: Import all the controller functions we need
const { 
    getServices, 
    createService, 
    updateService, 
    deleteService 
} = require('../controllers/serviceController');
const { protectBarber } = require('../middleware/barberAuthMiddleware');

// This handles GET requests to /api/services (to fetch all services)
// and POST requests to /api/services (to create a new service).
router.route('/')
    .get(protectBarber, getServices)
    .post(protectBarber, createService);

// NEW: This handles requests for a SPECIFIC service by its ID (e.g., /api/services/someId123)
// All actions on this route are protected to ensure only the owner can modify their service.
router.route('/:id')
    .put(protectBarber, updateService)      // A PUT request will update the service.
    .delete(protectBarber, deleteService); // A DELETE request will remove the service.

module.exports = router;


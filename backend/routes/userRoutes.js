const express = require('express');
const router = express.Router();

//Defining the route for customer registration
//Using post because signup will send the data to the database
const { registerUser, loginUser, adminLogin } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', adminLogin);

module.exports = router;
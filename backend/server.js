//importing express
const express = require('express');
const dotenv = require('dotenv'); 
const cors = require('cors');
const connectDB = require('./config/db');
// This must be at the top to load the environment variables
dotenv.config();
connectDB();

// create instance/object of express
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// This is a crucial new step! It tells Express to automatically understand and
// read any JSON data that our frontend sends in the body of a request.
app.use(cors()); // New: Use cors middleware to allow cross-origin requests
app.use(express.json());
// --- End of Middlewares ---

const userRoutes = require('./routes/userRoutes');
// We tell our Express app to use these routes.
// This line means: "For any URL that starts with '/api/users',
// go look for instructions inside the 'userRoutes' file."
app.get('/', (req, res) => {
    res.json({message: "Welcome to barberconnect API!"})
});

app.use('/api/users', userRoutes);
app.use('/api/barbers', require('./routes/barberRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`)
});
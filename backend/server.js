const express = require('express');
const dotenv = require('dotenv'); 
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// This must be at the top to load the environment variables
dotenv.config();
connectDB();

// create instance/object of express
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Serve Static Frontend Files ---
app.use(express.static(path.join(__dirname, '../frontend')));

// --- API Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/barbers', require('./routes/barberRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// --- Main Route ---
// THE FIX: We use a Regular Expression (/.*/) instead of a string path.
// This forces Express to match ANY url that hasn't been handled above
// and serve the index.html file. This works on all versions of Express.
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(Backend server is running on http://localhost:${PORT})
});

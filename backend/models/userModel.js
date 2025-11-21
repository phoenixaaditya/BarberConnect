const mongoose = require('mongoose');

// A "Schema" is the blueprint for our data.
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        // NEW: Add the role field
        role: {
            type: String,
            required: true,
            default: 'customer', // All new signups will automatically be customers
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);

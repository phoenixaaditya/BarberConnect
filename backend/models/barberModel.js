const mongoose = require('mongoose');

const barberSchema = mongoose.Schema(
    {
        ownerName: {
            type: String,
            required: [true, 'Please add an owner name'],
        },
        // NEW: Added the shopName field
        shopName: {
            type: String,
            required: [true, 'Please add a shop name'],
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
        phone: {
            type: String,
            required: true,
        },
        shopAddress: {
            type: String,
            required: true,
        },
        shopCategory: {
            type: String,
            required: true,
        },
        tradeLicenseNumber: {
            type: String,
            required: true,
        },
        tradeLicenseImage: {
            type: String,
            required: true,
        },
        gstNumber: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            default: 'pending', // pending, approved, rejected
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Barber', barberSchema);


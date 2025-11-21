const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
    {
        // Link to the customer who booked the appointment
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        // Link to the barber shop where the appointment is
        barber: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Barber',
        },
        // An array to hold one or more services booked in this appointment
        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Service',
            },
        ],
        // The specific date and time of the appointment
        dateTime: {
            type: Date,
            required: true,
        },
        // The total price calculated from all the services
        totalPrice: {
            type: Number,
            required: true,
        },
        // The total estimated duration from all the services
        totalDuration: {
            type: Number, // in minutes
            required: true,
        },
        // The status of the appointment (e.g., confirmed, completed, cancelled)
        status: {
            type: String,
            required: true,
            default: 'confirmed',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

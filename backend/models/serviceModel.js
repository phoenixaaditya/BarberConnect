const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
    {
        // This is a special field that creates a link to our 'Barber' model.
        // It tells the database that every service MUST belong to a barber.
        barber: {
            type: mongoose.Schema.Types.ObjectId, // The unique ID of the barber
            required: true,
            ref: 'Barber', // The name of the model we are linking to
        },
        name: {
            type: String,
            required: [true, 'Please add a service name'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
        },
        duration: {
            type: Number, // Stored in minutes
            required: [true, 'Please add a duration in minutes'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Service', serviceSchema);

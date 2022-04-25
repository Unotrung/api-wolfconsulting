const mongoose = require('mongoose');

const eap_otpSchema = new mongoose.Schema({

    username: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    otp: {
        type: String,
        required: [true, 'Otp is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1m' }
    }
    // After 1 minutes it deleted automatically from the database

}, { timestamps: true });

module.exports = mongoose.model('eap_otp', eap_otpSchema);
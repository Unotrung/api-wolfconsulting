const mongoose = require('mongoose');

const eap_otpsSchema = new mongoose.Schema({
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
        index: { expires: 300 }
    }
    // After 5 minutes it deleted automatically from the database
}, { timestamps: true });

module.exports = mongoose.model('eap_otps', eap_otpsSchema);
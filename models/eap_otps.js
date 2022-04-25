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
        index: { expires: 60 }
    }
    // After 1 minutes it deleted automatically from the database

}, { timestamps: true });

eap_otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.model('eap_otp', eap_otpSchema);
const mongoose = require('mongoose');

const eap_otpsSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [6, 'The minimum length of username is 6 characters'],
        maxlength: [64, 'The maximum length of username is 64 characters'],
    },
    email: {
        type: String,
        minlength: [10, 'The minimum length of email is 10 characters'],
        maxlength: [255, 'The maximum length of email is 255 characters'],
    },
    phone: {
        type: String,
        minlength: [10, 'Phone number must be 10 digits'],
        maxlength: [10, 'Phone number must be 10 digits'],
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
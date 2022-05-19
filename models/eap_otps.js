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
    expiredAt: {
        type: Date
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('eap_otp', eap_otpSchema);
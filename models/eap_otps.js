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
        type: Date,
        default: Date.now,
        index: { expires: 60 }
    }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('eap_otps', eap_otpSchema);
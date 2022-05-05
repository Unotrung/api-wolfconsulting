const mongoose = require('mongoose');

const eap_blacklistSchema = new mongoose.Schema({

    phone: {
        type: String,
    },
    attempts: {
        type: Number,
        required: true,
        default: 0,
        max: 5,
        min: 0
    },
    lockUntil: {
        type: Number
    },

}, { timestamps: true });

module.exports = mongoose.model('eap_blacklist', eap_blacklistSchema);
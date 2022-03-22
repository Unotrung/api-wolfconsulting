const dotenv = require('dotenv');
const mongoose = require('mongoose');

const eap_refreshtokensSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('eap_refreshtokens', eap_refreshtokensSchema);
const mongoose = require('mongoose');

const eap_refreshtokenSchema = new mongoose.Schema({

    refreshToken: {
        type: String,
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model('eap_refreshtoken', eap_refreshtokenSchema);
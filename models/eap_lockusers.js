const mongoose = require('mongoose');

const eap_lockuserSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
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

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('eap_lockusers', eap_lockuserSchema);
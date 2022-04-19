const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const dotenv = require('dotenv');
const mongooseDelete = require('mongoose-delete');

dotenv.config();

const eap_customerSchema = new mongoose.Schema({

    username: {
        type: String,
        required: [true, 'Username is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },

}, { timestamps: true });

const secret = process.env.SECRET_MONGOOSE;
eap_customerSchema.plugin(encrypt, { secret: secret, encryptedFields: ['username', 'email', 'phone', 'password'] });

// Add plugin
eap_customerSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' }); // Soft Delete

module.exports = mongoose.model('eap_customer', eap_customerSchema);
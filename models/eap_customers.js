const mongoose = require('mongoose');

const eap_customersSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: false,
        required: [true, 'Username is required'],
        minlength: [6, 'The minimum length of username is 6 characters'],
        maxlength: [64, 'The maximum length of username is 64 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        minlength: [10, 'The minimum length of email is 10 characters'],
        maxlength: [255, 'The maximum length of email is 255 characters'],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: [true, 'Phone already exists'],
        minlength: [10, 'Phone number must be 10 digits'],
        maxlength: [10, 'Phone number must be 10 digits'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'The minimum length of password is 8 characters'],
        maxlength: [64, 'The maximum length of password is 64 characters'],
    },
}, { timestamps: true });

module.exports = mongoose.model('eap_customers', eap_customersSchema);
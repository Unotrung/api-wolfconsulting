const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        minlength: [6, 'The minimum length of username is 6 characters'],
        maxlength: [64, 'The maximum length of username is 64 characters'],
        unique: [true, 'Username already exists'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        minlength: [10, 'The minimum length of email is 10 characters'],
        maxlength: [255, 'The maximum length of email is 255 characters'],
        unique: [true, 'Email already exists'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address'],
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        unique: [true, 'Phone already exists'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'The minimum length of password is 8 characters'],
        maxlength: [255, 'The maximum length of password is 255 characters'],
    },
    admin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
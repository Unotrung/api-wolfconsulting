const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username already exists'],
        minlength: [6, 'The minimum length of username is 6 characters'],
        maxlength: [64, 'The maximum length of username is 64 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        minlength: [10, 'The minimum length of email is 10 characters'],
        maxlength: [255, 'The maximum length of email is 255 characters'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address'],
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
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,64}$/, 'Password must be have 1 uppercase, 1 digit, 1 special character']
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    dueDate: {
        type: Date,
        required: true,
    },
    provider: {
        type: String,
        required: true,
    },
    paidMoney: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    user: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Repayment', repaymentSchema);
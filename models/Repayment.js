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
    serviceCharge: {
        type: Number,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Repayment', repaymentSchema);
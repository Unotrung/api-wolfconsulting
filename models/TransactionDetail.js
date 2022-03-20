const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const transactionDetailSchema = new mongoose.Schema({
    type: {
        type: String
    },
    ship: {
        type: Number,
    },
    conversionFee: {
        type: Number,
    },
    paymentTime: {
        type: Number
    },
    transaction_id: {
        type: String,
        ref: Transaction
    }
}, { timestamps: true });

module.exports = mongoose.model('TransactionDetail', transactionDetailSchema);
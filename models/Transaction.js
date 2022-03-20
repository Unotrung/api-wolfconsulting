const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    product: {
        type: String,
        required: true,
    },
    price: {
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

module.exports = mongoose.model('Transaction', transactionSchema);
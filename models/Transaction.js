const mongoose = require('mongoose');
const eap_customer = require('./eap_customers');

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
    type: {
        type: String,
        required: true,
    },
    ship: {
        type: Number,
        required: true,
    },
    conversionFee: {
        type: Number,
        required: true,
    },
    paymentTime: {
        type: Number,
        required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'eap_customer' }

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('Transaction', transactionSchema);
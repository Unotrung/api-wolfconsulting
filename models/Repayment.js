const mongoose = require('mongoose');
const eap_customer = require('./eap_customers');

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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'eap_customer' },

}, { timestamps: true });

mongoose.SchemaTypes.String.set('trim', true);

module.exports = mongoose.model('Repayment', repaymentSchema);
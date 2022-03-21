const mongoose = require('mongoose');
const Repayment = require('../models/Repayment');

const repaymentDetailSchema = new mongoose.Schema({
    serviceCharge: {
        type: Number,
    },
    repayment_id: {
        type: String,
        ref: Repayment
    }
}, { timestamps: true });

module.exports = mongoose.model('RepaymentDetail', repaymentDetailSchema);
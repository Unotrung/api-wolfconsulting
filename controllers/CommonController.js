const Provider = require('../models/bnpl_providers');
const Repayment = require('../models/Repayment');
const Transaction = require('../models/Transaction');

const CommonController = {

    generateContract: (req, res, next) => {
        try {
            return res.status(200).json({
                message: "Get contract successfully",
                title1: "SAMPLE CONTENT - FEC INPUT LATER",
                title2: "HÌNH THỨC THANH TOÁN",
                content: "Đối tác được quyền thanh toán chậm cho việc mua sản phẩm trong thời hạn quy định trên Hợp đồng mua hàng hoá trả chậm. Giá sản phẩm sẽ được thanh toán định kỳ hàng ngày thông qua Ví dưới (ví tiền mặt) của Đối tác. Vui lòng duy trì thu nhập tại Ví dưới (ví tiền mặt) để hệ thống thực hiện thanh toán tự động, tránh việc trễ hạn và ảnh hưởng đến quyền lợi của Đối tác. Trường hợp thu nhập ví dưới không đủ vào ngày thanh toán định kỳ, khoản còn thiếu hệ thống sẽ tự động thu (từ ví dưới) vào những ngày kế tiếp, kể cả ngày lễ và cuối tuần. Thời gian khấu trừ ví dưới dự kiến sẽ bắt đầu trong vòng 7 ngày kể từ ngày nhận sản phẩm.",
                status: true
            })
        }
        catch (err) {
            next(err);
        }
    },

    generateProviders: async (req, res, next) => {
        try {
            const providers = await Provider.find();
            if (providers.length > 0) {
                return res.status(200).json({
                    count: providers.length,
                    data: providers,
                    message: "Get list provider success",
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "List provider is empty",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    },

    generateRepayment: async (req, res, next) => {
        let dueDate = req.body.dueDate;
        let provider = req.body.provider;
        let paidMoney = req.body.paidMoney;
        let status = req.body.status;
        let serviceCharge = req.body.serviceCharge;
        let user = req.body.user;
        if (dueDate !== null && provider !== null && paidMoney !== null && status !== null && serviceCharge !== null && user !== null) {
            const repayment = await Repayment({ dueDate: dueDate, provider: provider, paidMoney: paidMoney, status: status, serviceCharge: serviceCharge, user: user });
            await repayment.save((err, data) => {
                if (!err) {
                    return res.status(200).json({
                        data: data,
                        message: 'Add repayment successfully',
                        status: true
                    })
                }
                else {
                    return res.status(409).json({
                        err: err.message,
                        message: 'Add repayment failure',
                        status: false
                    })
                }
            })
        }
        else {
            return res.status(400).json({
                message: 'Please enter all fields',
                status: false
            })
        }
    },

    generateTransaction: async (req, res, next) => {
        let date = req.body.date;
        let provider = req.body.provider;
        let product = req.body.product;
        let price = req.body.price;
        let status = req.body.status;
        let user = req.body.user;
        let conversionFee = req.body.conversionFee;
        let paymentTime = req.body.paymentTime;
        let ship = req.body.ship;
        let type = req.body.type;
        if (date !== null && provider !== null && product !== null && price !== null && status !== null && user !== null && conversionFee !== null && paymentTime !== null && ship !== null && type !== null) {
            const transaction = await Transaction({ date: date, provider: provider, product: product, price: price, status: status, user: user, conversionFee: conversionFee, paymentTime: paymentTime, ship: ship, type: type });
            await transaction.save((err, data) => {
                if (!err) {
                    return res.status(200).json({
                        data: data,
                        message: 'Add transaction successfully',
                        status: true
                    })
                }
                else {
                    return res.status(409).json({
                        err: err.message,
                        message: 'Add transaction failure',
                        status: false
                    })
                }
            })
        }
        else {
            return res.status(400).json({
                message: 'Please enter all fields',
                status: false
            })
        }
    }

};

module.exports = CommonController;
const Provider = require('../models/bnpl_providers');

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

};

module.exports = CommonController;
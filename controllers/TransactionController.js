const Transaction = require('../models/Transaction');

const TransactionController = {

    getTransactions: async (req, res) => {
        try {
            // Số item trong 1 page
            const PAGE_SIZE = 3;
            // page hiện tại
            let page = req.query.page;
            // Lấy ra trường sort
            let sort = req.query.sort;
            // Tổng số item
            const totalItem = await Transaction.countDocuments({});
            // Tổng số trang
            const totalPage = Math.ceil(totalItem / PAGE_SIZE);
            if (page) {
                page = parseInt(page);
                if (page < 1) {
                    page = 1
                };
                if (page > totalPage) {
                    page = totalPage
                }
                // Bỏ qua n phần tử 
                var skipItem = (page - 1) * PAGE_SIZE;
                const result = await Transaction.find({}).skip(skipItem).limit(PAGE_SIZE).sort({ price: sort });
                return res.status(200).json({
                    data: result,
                    totalItem: totalItem,
                    totalPage: totalPage,
                    currentPage: page,
                    status: true,
                    sortPage: sort
                })
            }
            else {
                const result = await Transaction.find({}).sort({ price: sort });
                return res.status(200).json({
                    data: result,
                    totalItem: totalItem,
                    totalPage: totalPage,
                    currentPage: 1,
                    status: true,
                    sortPage: sort
                })
            }
        }
        catch (err) {
            return res.status(500).json({
                err: err,
                status: false
            })
        }
    }

}

module.exports = TransactionController;
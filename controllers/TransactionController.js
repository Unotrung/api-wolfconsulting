const Transaction = require('../models/Transaction');

const TransactionController = {

    getTransactions: async (req, res, next) => {
        try {
            let id = req.params.id;
            let data = await Transaction.find({ user: id });
            const totalItem = await Transaction.countDocuments({ user: id });
            if (data.length > 0) {
                const PAGE_SIZE = req.query.pageSize;
                const totalPage = Math.ceil(totalItem / PAGE_SIZE);
                let page = req.query.page || 1;
                if (page < 1) {
                    page = 1
                };
                if (page > totalPage) {
                    page = totalPage
                }
                page = parseInt(page);
                let sortByField = req.query.sortByField;
                let sortValue = req.query.sortValue;
                sortValue = parseInt(sortValue);
                var skipItem = (page - 1) * PAGE_SIZE;
                const sort = sortValue === 1 ? `${sortByField}` : `-${(sortByField)}`;
                const result = await Transaction.find({ user: id }).skip(skipItem).limit(PAGE_SIZE).sort(sort);
                return res.status(200).json({
                    message: "Get list transaction success",
                    data: result,
                    totalItem: totalItem,
                    totalPage: totalPage,
                    currentPage: page,
                    sortByField: sortByField,
                    sortValue: sortValue,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "You do not have any transaction",
                    totalItem: totalItem,
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    getTransactionDetail: async (req, res, next) => {
        try {
            let id = req.params.id;
            let idTransaction = req.params.idTransaction;
            let data = await Transaction.find({ user: id, _id: idTransaction });
            if (data.length > 0) {
                return res.status(200).json({
                    message: "Get transaction detail success",
                    data: data,
                    status: true
                })
            }
            else {
                return res.status(404).json({
                    message: "This transaction id is not exists",
                    status: false,
                    statusCode: 900
                });
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = TransactionController;
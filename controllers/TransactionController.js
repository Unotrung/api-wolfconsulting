const Transaction = require('../models/Transaction');
const TransactionDetail = require('../models/TransactionDetail');

const TransactionController = {

    getTransactions: async (req, res, next) => {
        try {
            let id = req.params.id;
            console.log("Id: ", id);

            let data = await Transaction.find({ user: id });
            console.log("Data: ", data.length);

            if (data.length > 0) {
                const totalItem = await Transaction.countDocuments({ user: id });
                console.log("Total Item: ", totalItem);

                const PAGE_SIZE = req.query.pageSize;
                console.log("Page Size: ", PAGE_SIZE);

                const totalPage = Math.ceil(totalItem / PAGE_SIZE);
                console.log("Total Page: ", totalPage);

                let page = req.query.page || 1;
                if (page < 1) {
                    page = 1
                };
                if (page > totalPage) {
                    page = totalPage
                }
                page = parseInt(page);
                console.log("Current Page: ", page);

                let sortByField = req.query.sortByField;
                console.log("Sort By Field: ", sortByField);

                let sortValue = req.query.sortValue;
                sortValue = parseInt(sortValue);
                console.log("Sort Value: ", sortValue);

                var skipItem = (page - 1) * PAGE_SIZE;

                const sort = sortValue === 1 ? `${sortByField}` : `-${(sortByField)}`;

                const result = await Transaction.find({ user: id }).skip(skipItem).limit(PAGE_SIZE).sort(sort);

                return res.status(200).json({
                    data: result,
                    totalItem: totalItem,
                    totalPage: totalPage,
                    currentPage: page,
                    status: true,
                    sortByField: sortByField,
                    sortValue: sortValue
                })
            }
            else {
                return res.status(200).json({
                    message: "You do not have any transaction",
                    status: true
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
            let data = await Transaction.findOne({ id: id });
            let result = await TransactionDetail.findOne({ transaction_id: id });
            if (result) {
                return res.status(200).json({
                    transaction: data,
                    transaction_detail: result,
                    status: true
                })
            }
            else {
                return res.status(400).json({
                    message: "This Transaction Id is not exists",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = TransactionController;
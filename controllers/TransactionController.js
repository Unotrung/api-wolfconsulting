const Transaction = require('../models/Transaction');

const TransactionController = {

    getTransactions: async (req, res, next) => {
        try {
            const totalItem = await Transaction.countDocuments({});

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

            const result = await Transaction.find({}).skip(skipItem).limit(PAGE_SIZE).sort(sort);

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
        catch (err) {
            next(err);
        }
    }

}

module.exports = TransactionController;
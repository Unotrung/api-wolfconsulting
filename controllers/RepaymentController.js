const Repayment = require('../models/Repayment');

const RepaymentController = {

    getRepayments: async (req, res) => {
        try {
            const totalItem = await Repayment.countDocuments({});
            console.log("Total Item:", totalItem);

            const PAGE_SIZE = req.query.pageSize;
            console.log("Page Size:", PAGE_SIZE);

            const totalPage = Math.ceil(totalItem / PAGE_SIZE);
            console.log("Total Page:", totalPage);

            let page = req.query.page || 1;
            if (page < 1) {
                page = 1
            };
            if (page > totalPage) {
                page = totalPage
            }
            page = parseInt(page);
            console.log("Page:", page);

            let sortByField = req.query.sortByField;
            console.log("Sort By Field:", sortByField);

            let sortValue = req.query.sortValue;
            sortValue = parseInt(sortValue);
            console.log("Sort Value:", sortValue);

            var skipItem = (page - 1) * PAGE_SIZE;
            console.log("Skip Item:", skipItem);

            const sort = sortValue === 1 ? `${sortByField}` : `-${(sortByField)}`;
            console.log("Sort:", sort);

            const result = await Repayment.find({}).skip(skipItem).limit(PAGE_SIZE).sort(sort);

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
            return res.status(500).json({
                err: err,
                status: false,
            })
        }
    }

}

module.exports = RepaymentController;
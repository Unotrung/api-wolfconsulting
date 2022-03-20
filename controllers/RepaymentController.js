const Repayment = require('../models/Repayment');

const RepaymentController = {

    getRepayments: async (req, res, next) => {
        try {
            let id = req.params.id;
            console.log("Id: ", id);

            let data = await Repayment.find({ user: id });
            console.log("Data: ", data.length);

            if (data.length > 0) {

                const totalItem = await Repayment.countDocuments({ user: id });
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

                const result = await Repayment.find({ user: id }).skip(skipItem).limit(PAGE_SIZE).sort(sort);

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
                    message: "You do not have any repayment",
                    status: true
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

}

module.exports = RepaymentController;
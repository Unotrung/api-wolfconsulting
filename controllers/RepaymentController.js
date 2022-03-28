const Repayment = require('../models/Repayment');

const RepaymentController = {

    getRepayments: async (req, res, next) => {
        try {
            let id = req.params.id;
            console.log("Id: ", id);

            let data = await Repayment.find({ user: id });
            console.log("Data: ", data.length);

            const totalItem = await Repayment.countDocuments({ user: id });
            console.log("Total Item: ", totalItem);

            if (data.length > 0) {
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
                    message: "Get Repayment List Success",
                    data: result,
                    totalItem: totalItem,
                    totalPage: totalPage,
                    currentPage: page,
                    sortByField: sortByField,
                    sortValue: sortValue,
                    status: true,
                })
            }
            else {
                return res.status(200).json({
                    message: "You do not have any repayment",
                    totalItem: totalItem,
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    getRepaymentDetail: async (req, res, next) => {
        try {
            let idRepayment = req.params.idRepayment;
            let data = await Repayment.findById(idRepayment);
            if (data) {
                return res.status(200).json({
                    message: "Get Repayment Detail Success",
                    data: data,
                    status: true
                })
            }
            else {
                return res.status(200).json({
                    message: "This Repayment Id is not exists",
                    status: false
                })
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = RepaymentController;
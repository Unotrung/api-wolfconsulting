const Repayment = require('../models/Repayment');

const RepaymentController = {

    getRepayments: async (req, res, next) => {
        try {
            let id = req.params.id;
            let data = await Repayment.find({ user: id });
            const totalItem = await Repayment.countDocuments({ user: id });
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
                const result = await Repayment.find({ user: id }).skip(skipItem).limit(PAGE_SIZE).sort(sort);
                return res.status(200).json({
                    message: "Get list repayment success",
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
            let id = req.params.id;
            let idRepayment = req.params.idRepayment;
            let data = await Repayment.find({ user: id, _id: idRepayment });
            if (data.length > 0) {
                return res.status(200).json({
                    message: "Get repayment detail success",
                    data: data,
                    status: true
                })
            }
            else {
                return res.status(404).json({
                    message: "This repayment id is not exists",
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

module.exports = RepaymentController;
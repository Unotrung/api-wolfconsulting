const Repayment = require('../models/Repayment');
const { MSG_GET_LIST_SUCCESSFULLY, MSG_LIST_IS_EMPTY, MSG_GET_DETAIL_SUCCESSFULLY, MSG_NOT_FOUND } = require('../config/response/response');

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
                const result = await Repayment.find({ user: id }).skip(skipItem).limit(PAGE_SIZE).sort(sort).select('-__v -createdAt -updatedAt -user');
                return res.status(200).json({
                    message: MSG_GET_LIST_SUCCESSFULLY,
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
                    message: MSG_LIST_IS_EMPTY,
                    totalItem: totalItem,
                    status: true
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
            let data = await Repayment.find({ user: id, _id: idRepayment }).select('-__v -user');
            if (data.length > 0) {
                return res.status(200).json({
                    message: MSG_GET_DETAIL_SUCCESSFULLY,
                    data: data,
                    status: true
                })
            }
            else {
                return res.status(404).json({
                    message: MSG_NOT_FOUND,
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
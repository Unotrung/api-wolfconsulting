const Customer = require('../models/eap_customers');
const bcrypt = require('bcrypt');
const {
    MSG_GET_INFORMATION_USER_SUCCESS, MSG_GET_INFORMATION_NOT_EXISTS, MSG_UPDATE_SUCCESSFULLY, MSG_UPDATE_FAILURE, MSG_ENTER_ALL_FIELDS
    MSG_INCORRECT_OLD_PASSWORD, MSG_OLD_PASSWORD_AND_NEW_PASSWORD_MUST_NOT_BE_THE_SAME
}
    = require('../config/response/response');

const UserController = {

    // getAllUser: async (req, res, next) => {
    //     try {
    //         const users = await Customer.find();
    //         let arrUsers = [];
    //         users.map((user, index) => {
    //             let { createdAt, updatedAt, deleted, password, __v, ...others } = user._doc;
    //             arrUsers.push({ ...others });
    //         })
    //         if (users.length > 0) {
    //             return res.status(200).json({
    //                 count: users.length,
    //                 data: arrUsers,
    //                 message: MSG_GET_LIST_SUCCESSFULLY,
    //                 status: true
    //             });
    //         }
    //         else {
    //             return res.status(200).json({
    //                 message: MSG_LIST_IS_EMPTY,
    //                 status: true
    //             });
    //         }
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    getUser: async (req, res, next) => {
        try {
            const user = await Customer.findById(req.params.id);
            if (user) {
                const { password, __v, loginAttempts, loginLockUntil, otpPasswordAttempts, otpPasswordLockUntil, otpEmaildAttempts, otpEmailLockUntil, otpPhonedAttempts, otpPhoneLockUntil, deleted, createdAt, updatedAt, ...others } = user._doc;
                return res.status(200).json({
                    data: { ...others },
                    message: MSG_GET_INFORMATION_USER_SUCCESS,
                    status: true
                });
            }
            else {
                return res.status(404).json({
                    message: MSG_GET_INFORMATION_NOT_EXISTS,
                    status: false,
                    statusCode: 900
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    updateUser: async (req, res, next) => {
        try {
            let OLD_PASSWORD = req.body.password;
            let NEW_PASSWORD = req.body.new_password;
            let USERNAME = req.body.username;
            const user = await Customer.findById(req.params.id);
            if ((OLD_PASSWORD !== null && OLD_PASSWORD !== '' && NEW_PASSWORD !== null && NEW_PASSWORD !== '') || (USERNAME !== null && USERNAME !== '')) {
                if (user) {
                    if (OLD_PASSWORD && NEW_PASSWORD) {
                        const validPassword = await bcrypt.compare(OLD_PASSWORD, user.password);
                        if (!validPassword) {
                            return res.status(404).json({
                                message: MSG_INCORRECT_OLD_PASSWORD,
                                status: false,
                                statusCode: 1003
                            });
                        }
                        else {
                            if (OLD_PASSWORD === NEW_PASSWORD) {
                                return res.status(400).json({
                                    message: MSG_OLD_PASSWORD_AND_NEW_PASSWORD_MUST_NOT_BE_THE_SAME,
                                    status: false,
                                    statusCode: 1006
                                });
                            }
                            else {
                                const salt = await bcrypt.genSalt(10);
                                const hashed = await bcrypt.hash(NEW_PASSWORD, salt);
                                user.password = hashed;
                                await user.save()
                                    .then(() => {
                                        return res.status(201).json({
                                            message: MSG_UPDATE_SUCCESSFULLY,
                                            status: true
                                        })
                                    })
                                    .catch((err) => {
                                        return res.status(409).json({
                                            message: MSG_UPDATE_FAILURE,
                                            status: false,
                                            errorStatus: err.status || 500,
                                            errorMessage: err.message
                                        })
                                    })
                            }
                        }
                    }
                    else if (USERNAME) {
                        user.username = USERNAME;
                        await user.save()
                            .then(() => {
                                return res.status(201).json({
                                    message: MSG_UPDATE_SUCCESSFULLY,
                                    status: true
                                });
                            })
                            .catch((err) => {
                                return res.status(409).json({
                                    message: MSG_UPDATE_FAILURE,
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                })
                            })
                    }
                }
                else {
                    return res.status(404).json({
                        message: MSG_GET_INFORMATION_NOT_EXISTS,
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else (OLD_PASSWORD === null && OLD_PASSWORD === '' && NEW_PASSWORD === null && NEW_PASSWORD === '') && (USERNAME === null && USERNAME === '')
            {
                return res.status(400).json({
                    message: MSG_ENTER_ALL_FIELDS,
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

}

module.exports = UserController;

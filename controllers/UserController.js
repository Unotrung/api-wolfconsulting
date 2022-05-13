const Customer = require('../models/eap_customers');
const bcrypt = require('bcrypt');

const UserController = {

    getAllUser: async (req, res, next) => {
        try {
            const users = await Customer.find();
            let arrUsers = [];
            users.map((user, index) => {
                let { createdAt, updatedAt, deleted, password, __v, ...others } = user._doc;
                arrUsers.push({ ...others });
            })
            if (users.length > 0) {
                return res.status(200).json({
                    count: users.length,
                    data: arrUsers,
                    message: "Get list customer success",
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "List customer is empty",
                    status: true
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    getUser: async (req, res, next) => {
        try {
            const user = await Customer.findById(req.params.id);
            if (user) {
                const { passsword, __v, ...others } = user._doc;
                return res.status(200).json({
                    message: "Get information of user successfully",
                    data: { ...others },
                    status: true
                });
            }
            else {
                return res.status(404).json({
                    message: "This account infomation is not exists !",
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
                                message: "Your old password is not correct. Please try again !",
                                status: false,
                                statusCode: 1003
                            });
                        }
                        else {
                            if (OLD_PASSWORD === NEW_PASSWORD) {
                                return res.status(400).json({
                                    message: "Old password and new password are the same. Please try again !",
                                    status: false,
                                    statusCode: 1006
                                });
                            }
                            else {
                                const salt = await bcrypt.genSalt(10);
                                const hashed = await bcrypt.hash(NEW_PASSWORD, salt);
                                user.password = hashed;
                                await user.save()
                                    .then((data) => {
                                        return res.status(201).json({
                                            message: "Update password successfully",
                                            status: true
                                        })
                                    })
                                    .catch((err) => {
                                        return res.status(409).json({
                                            message: "Update password failure",
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
                            .then((data) => {
                                return res.status(201).json({
                                    message: "Update username successfully",
                                    status: true
                                });
                            })
                            .catch((err) => {
                                return res.status(409).json({
                                    message: "Update username failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                })
                            })
                    }
                }
                else {
                    return res.status(404).json({
                        message: "This account is not exists !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your old password and new password or username !",
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

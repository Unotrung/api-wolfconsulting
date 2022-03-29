const Customer = require('../models/eap_customers');
const bcrypt = require('bcrypt');

const UserController = {

    getAllUser: async (req, res, next) => {
        try {
            const users = await Customer.find();
            if (users.length > 0) {
                return res.status(200).json({
                    message: "Get List Customer Successfully",
                    users: users,
                    count: users.length,
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "List User EAP Is Empty",
                    status: false
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
                return res.status(200).json({
                    message: "Get User Successfully",
                    user: user,
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "This account is not exists !",
                    status: false
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
            // if ((OLD_PASSWORD !== null && OLD_PASSWORD !== '' && NEW_PASSWORD !== null && NEW_PASSWORD !== '') || (USERNAME !== null && USERNAME !== '')) {
            const user = await Customer.findById(req.params.id);
            if (user) {
                if (OLD_PASSWORD !== null && OLD_PASSWORD !== '' && NEW_PASSWORD !== null && NEW_PASSWORD !== '') {
                    const validPassword = await bcrypt.compare(OLD_PASSWORD, user.password);
                    if (!validPassword) {
                        return res.status(200).json({
                            message: "Your Old Password Is Not Correct. Please Try Again !",
                            status: false
                        });
                    }
                    else {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(NEW_PASSWORD, salt);
                        await user.updateOne({ $set: { password: hashed } }, (err) => {
                            if (!err) {
                                return res.status(201).json({
                                    message: "Update Password Successfully",
                                    status: true
                                });
                            }
                            else {
                                return res.status(200).json({
                                    message: "Update Password Failure",
                                    status: false
                                });
                            }
                        }).clone().catch((err) => {
                            return res.status(200).json({
                                err: err,
                                messsage: "Something is wrong in update password !",
                                status: false,
                            })
                        });
                    }
                }
                else if (USERNAME !== null && USERNAME !== '') {
                    await Customer.updateOne({ $set: { username: USERNAME } }, (err) => {
                        if (!err) {
                            return res.status(201).json({
                                message: "Update Username Successfully",
                                status: true
                            });
                        }
                        else {
                            return res.status(200).json({
                                message: "Update Username Failure",
                                status: false
                            });
                        }
                    }).clone().catch((err) => {
                        return res.status(200).json({
                            err: err,
                            messsage: "Something is wrong in update username !",
                            status: false,
                        })
                    });
                }
            }
            else {
                return res.status(200).json({
                    message: "This account is not exists !",
                    status: false
                });
            }
            // }
            // else {
            //     return res.status(200).json({
            //         message: "Please enter your old password and new password or username!",
            //         status: false
            //     });
            // }
        }
        catch (err) {
            next(err);
        }
    },

}

module.exports = UserController;

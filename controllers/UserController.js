const User = require('../models/User');

const UserController = {

    getAllUser: async (req, res, next) => {
        try {
            const users = await User.find();
            if (users.length > 0) {
                return res.status(200).json({
                    users: users,
                    message: "Get Users Successfully",
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "Get Users Failure",
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
            const user = await User.findOne({ phone: req.params.phone });
            if (user) {
                return res.status(200).json({
                    user: user,
                    message: "Get User Successfully",
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "User does not exists",
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
            const user = await User.findById(req.params.id);
            if (user) {
                await user.updateOne({ $set: req.body });
                return res.status(200).json({
                    message: "Update User Successfully",
                    status: true
                });
            }
            else {
                return res.status(200).json({
                    message: "User does not exists",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = UserController;

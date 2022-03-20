const User = require('../models/User');
const bcrypt = require('bcrypt');

const UserController = {

    getAllUser: async (req, res, next) => {
        try {
            const users = await User.find();
            if (users.length > 0) {
                return res.status(200).json({
                    message: "Get List User Successfully",
                    users: users,
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "Get List User Failure",
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
            const user = await User.findOne({ phone: req.params.id });
            if (user) {
                return res.status(200).json({
                    message: "Get User Successfully",
                    user: user,
                    status: true
                });
            }
            else {
                return res.status(401).json({
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
            const user = await User.findById(req.params.id);
            if (user) {
                if (req.body.password) {
                    const validPassword = await bcrypt.compare(req.body.password, user.password);
                    if (!validPassword) {
                        return res.status(401).json({
                            message: "Your Old Password Is Not Correct ! Please Try Again",
                            status: true
                        });
                    }
                    else {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(req.body.new_password, salt);
                        await user.updateOne({ $set: { password: hashed } });
                        return res.status(200).json({
                            message: 'Update Password Successfully',
                            status: true
                        });
                    }
                }
                else {
                    await user.updateOne({ $set: req.body });
                    return res.status(200).json({
                        message: `Update ${req.body} Successfully`,
                        status: true
                    });
                }
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
    }

}

module.exports = UserController;

const User = require('../models/User');

const UserController = {
    getAllUser: async (req, res) => {
        try {
            const users = await User.find();
            if (users.length > 0) {
                res.status(200).json(users);
            }
            else {
                res.status(500).json("User List is empty");
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                res.status(200).json(user);
            }
            else {
                res.status(500).json("User is not exists");
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                res.status(500).json("User is not exists");
            }
            else {
                res.status(200).json("Delete User Successfully");
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = UserController;

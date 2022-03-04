const User = require('../models/User');

const UserController = {
    getAllUser: async (req, res) => {
        try {
            const users = await User.find();
            if (users.length > 0) {
                return res.status(200).json(users);
            }
            else {
                return res.status(200).json("User List is empty");
            }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                return res.status(200).json(user);
            }
            else {
                return res.status(200).json("User is not exists");
            }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(200).json("User is not exists");
            }
            else {
                return res.status(200).json("Delete User Successfully");
            }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    }
}

module.exports = UserController;

const Auth = require('../models/User');
const bcrypt = require('bcrypt');

const AuthController = {
    register: async (req, res) => {
        try {
            // Get data from User
            let username = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password = req.body.password;
            // Encryption password with bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            // Create New User 
            const newUser = await new Auth({
                username: username,
                email: email,
                phone: phone,
                password: hashed
            });
            // Save To DB
            const user = await newUser.save();
            res.status(200).json(user);
        }
        catch (err) {
            res.status(500).json(err);
        }
    },

    login: async (req, res) => {
        try {
            // Vì email là unique => Chỉ cần tìm 1 
            const auth = await Auth.findOne({ email: req.body.email });
            if (!auth) {
                res.status(404).json("Wrong Email!");
            }
            // So sánh mk của người dùng và mk trong db (so sánh 2 cái mk được mã hóa)
            const validPassword = await bcrypt.compare(req.body.password, auth.password);
            if (!validPassword) {
                res.status(404).json("Wrong Password!");
            }
            if (auth && validPassword) {
                res.status(200).json(auth);
            }
        }
        catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = AuthController;
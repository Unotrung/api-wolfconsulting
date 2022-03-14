const Auth = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const otpGenerator = require('otp-generator');

let refreshTokens = [];

const AuthController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                phone: user.phone
            },
            // Add a secret key to make it more secure
            process.env.JWT_ACCESS_KEY,
            // After 7 hours this accessoken will disappear and the user has to login again
            { expiresIn: "1h" }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                phone: user.phone
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "1h" }
        );
    },

    sendOtp: async (req, res) => {
        try {
            const auth = await Auth.findOne({ $or: [{ phone: req.body.phone }, { email: req.body.email }] });
            if (auth) {
                return res.status(401).json({
                    message: "This account already exists ! Please Login",
                    isExist: true
                });
            }
            else {
                const USERNAME = req.body.username;
                const EMAIL = req.body.email;
                const PHONE = req.body.phone;
                const OTP = otpGenerator.generate(6, {
                    digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
                });
                if (USERNAME !== null && EMAIL !== null && PHONE !== null && OTP !== null) {
                    const dataTemp = new Otp({ username: USERNAME, email: EMAIL, phone: PHONE, otp: OTP });
                    const result = await dataTemp.save();
                    const { otp, password, ...others } = result._doc;
                    return res.status(200).json({
                        message: "Send OTP Successfully",
                        otp: OTP,
                        isExist: false,
                        data: { ...others }
                    });
                }
            }
        }
        catch (err) {
            return res.status(500).json({
                message: "Send OTP Failure",
                status: false,
                err: err,
            });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const otpUser = await Otp.find({ email: req.body.email, phone: req.body.phone, username: req.body.username });
            if (otpUser.length === 0) {
                return res.status(401).json({ message: "Expired OTP ! Please Resend OTP" });
            }
            // Get last otp. 
            const lastOtp = otpUser[otpUser.length - 1];
            if (lastOtp.phone === req.body.phone && lastOtp.otp === req.body.otp) {
                let username = req.body.username;
                let email = req.body.email;
                let phone = req.body.phone;
                let user = {
                    username: username,
                    email: email,
                    phone: phone
                };
                const deleteOTP = await Otp.deleteMany({ phone: lastOtp.phone });
                return res.status(200).json({
                    message: "OTP VALID",
                    user: user,
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "OTP INVALID",
                    status: false
                });
            }
        }
        catch (err) {
            return res.status(500).json({ err: err });
        }
    },

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
            return res.status(200).json({
                message: "Register Successfully",
                user: user,
                status: true
            });
        }
        catch (err) {
            return res.status(500).json({
                message: "Register Failure",
                err: err,
                status: false
            });
        }
    },

    login: async (req, res) => {
        try {
            const auth = await Auth.findOne({ phone: req.body.phone });
            if (!auth) {
                return res.status(401).json({ message: "Wrong phone !" });
            }
            // Compare user password and db password (compare 2 encrypted password)
            const validPassword = await bcrypt.compare(req.body.password, auth.password);
            if (!validPassword) {
                return res.status(401).json({ message: "Wrong Password !" });
            }
            if (auth && validPassword) {
                // If auth and validPassword are valid, attach the accessToken
                const accessToken = AuthController.generateAccessToken(auth);
                // When the user's accessToken expires, it will automatically Refresh
                const refreshToken = AuthController.generateRefreshToken(auth);
                // Store refreshToken
                refreshTokens.push(refreshToken);
                // Save refreshToken to cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false, // When deploying to the server, change it back to true
                    path: '/', // It's okay to have it or not
                    sameSite: 'strict', // Prevent the attack. Http Requests can only come from this site
                });
                const { password, ...others } = auth._doc;
                // Khi trả thông tin người dùng về thì ta không nên trả về password kèm theo chỉ cần trả về những thông tin khác ngoại trừ password
                // đồng thời gắn kèm theo accessToken và refreshToken
                // Bởi vì ta đã lưu cái refreshToken này trong cookie òi nên mình không cần trả về front end. Mặc định khi đăng nhập ta sẽ luôn có 1 cookie
                // chứa refreshToken
                return res.status(200).json({
                    message: "Login Successfully",
                    accessToken: accessToken,
                    data: { ...others }
                });
            }
        }
        catch (err) {
            return res.status(500).json({
                message: "Login Failure",
                err: err
            });
        }
    },

    requestRefreshToken: async (req, res) => {
        // Take RefreshToken From User 
        // Ta lưu cookies với name là refreshToken thì khi gọi về cũng phải là req.cookies.refreshToken
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json('You are not authenticated');
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json('Refresh Token is not valid');
        }
        // Xác minh refreshToken này có hợp lệ không?
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                console.log(err);
            }
            // Lọc refreshToken cũ đi trước khi thêm refreshToken mới vào
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            const newAccessToken = AuthController.generateAccessToken(user);
            const newRefreshToken = AuthController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false, // Khi deploy lên server nên đổi lại là true
                path: '/', // Có cũng được không có cũng không sao
                sameSite: 'strict', // Ngăn chặn cách tấn công. Những cái http Request chỉ được đến từ site này thôi
            });
            return res.status(200).json({ accessToken: newAccessToken });
        }
        )
    },

    logout: async (req, res) => {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        return res.status(200).json({ message: 'Logged out success !' });
    },

    forgotPassword: async (req, res) => {
        try {
            const auth = await Auth.findOne({ phone: req.body.phone });
            if (!auth) {
                return res.status(401).json({
                    message: "This account does not exists ! Please Register",
                    isExist: false
                });
            }
            else {
                const PHONE = req.body.phone;
                const OTP = otpGenerator.generate(6, {
                    digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
                });
                if (PHONE !== null && OTP !== null) {
                    const dataTemp = new Otp({ phone: PHONE, otp: OTP });
                    const result = await dataTemp.save();
                    const token = jwt.sign(
                        {
                            id: result.id,
                            phone: result.phone
                        },
                        // Add a secret key to make it more secure
                        process.env.JWT_ACCESS_KEY,
                        // After 7 hours this accessoken will disappear and the user has to login again
                        { expiresIn: "60s" }
                    );
                    return res.status(200).json({
                        message: "Send OTP Successfully",
                        data: {
                            phone: PHONE,
                            otp: OTP
                        },
                        token: token,
                        status: true,
                    });
                }
            }
        }
        catch (err) {
            return res.status(500).json({
                message: "Send OTP Failure",
                status: false,
                err: err,
            });
        }
    },

    verifyOtpPassword: async (req, res) => {
        try {
            const otpUser = await Otp.find({ phone: req.body.phone });
            console.log("PHONE:", req.body.phone);
            if (otpUser.length === 0) {
                return res.status(401).json({ message: "Expired OTP ! Please Resend OTP" });
            }
            // Get last otp. 
            const lastOtp = otpUser[otpUser.length - 1];
            if (lastOtp.phone === req.body.phone && lastOtp.otp === req.body.otp) {
                const deleteOTP = await Otp.deleteMany({ phone: lastOtp.phone });
                return res.status(200).json({
                    message: "OTP VALID",
                    phone: req.body.phone,
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "OTP INVALID",
                    status: false
                });
            }
        }
        catch (err) {
            return res.status(500).json({ err: err });
        }
    },

    updatePassword: async (req, res) => {
        try {
            const user = await Auth.findOne({ phone: req.body.phone });
            if (user) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.password, salt);
                await user.updateOne({ $set: { password: hashed } });
                return res.status(200).json({
                    message: "Update Password Successfully",
                    status: true
                });
            }
        }
        catch (err) {
            return res.status(500).json({
                message: "Update Password Failure",
                status: false,
                err: err
            });
        }
    },

}

module.exports = AuthController;
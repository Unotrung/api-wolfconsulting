const Customer = require('../models/eap_customers');
const Otp = require('../models/eap_otps');
const RefreshToken = require('../models/eap_refreshtokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const AuthController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                phone: user.phone
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "40m" }
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
            { expiresIn: "3h" }
        );
    },

    sendOtp: async (req, res, next) => {
        try {
            const auth = await Customer.findOne({ $or: [{ phone: req.body.phone }, { email: req.body.email }] });
            if (auth) {
                return res.status(401).json({
                    message: "This account is already exists ! Please Login",
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
                    const { otp, ...others } = result._doc;
                    return res.status(200).json({
                        message: "Send OTP Successfully",
                        data: { ...others },
                        otp: OTP,
                        isExist: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtp: async (req, res, next) => {
        try {
            const otpUser = await Otp.find({ email: req.body.email, phone: req.body.phone, username: req.body.username });
            if (otpUser.length === 0) {
                return res.status(401).json({ message: "Expired OTP ! Please Resend OTP" });
            }
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
            next(err);
        }
    },

    register: async (req, res, next) => {
        try {
            let username = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password = req.body.password;
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            const newUser = await new Customer({
                username: username,
                email: email,
                phone: phone,
                password: hashed
            });
            const user = await newUser.save();
            return res.status(200).json({
                message: "Register Successfully",
                user: user,
                status: true
            });
        }
        catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const auth = await Customer.findOne({ $or: [{ phone: req.body.phone_email }, { email: req.body.phone_email }] });
            if (!auth) {
                return res.status(401).json({ message: "Wrong phone/Email !" });
            }
            const validPassword = await bcrypt.compare(req.body.password, auth.password);
            if (!validPassword) {
                return res.status(401).json({ message: "Wrong Password !" });
            }
            if (auth && validPassword) {
                const accessToken = AuthController.generateAccessToken(auth);
                const refreshToken = AuthController.generateRefreshToken(auth);
                const refreshTokens = new RefreshToken({ refreshToken: refreshToken });
                await refreshTokens.save();
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });
                const { password, ...others } = auth._doc;
                return res.status(200).json({
                    message: "Login Successfully",
                    token: accessToken,
                    data: { ...others }
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    requestRefreshToken: async (req, res, next) => {
        try {
            // Get refreshToken from cookie
            const refreshToken = req.cookies.refreshToken;
            const refreshTokens = await RefreshToken.find();
            console.log("RefreshTokens Find: ", refreshTokens);
            if (!refreshToken) {
                return res.status(401).json('You are not authenticated');
            }
            let data = refreshTokens.find((x) => x.refreshToken === refreshToken);
            console.log("Data: ", data);
            if (!data) {
                return res.status(403).json('Refresh Token is not valid');
            }
            jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
                if (err) {
                    console.log(err);
                }
                let listRefreshToken = refreshTokens.filter((x) => x.refreshToken !== refreshToken);
                console.log("List RefreshToken: ", listRefreshToken);
                const newAccessToken = AuthController.generateAccessToken(user);
                const newRefreshToken = AuthController.generateRefreshToken(user);
                await RefreshToken.updateOne({ refreshToken: data.refreshToken }, { refreshToken: newRefreshToken });
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });
                return res.status(200).json({
                    token: newAccessToken,
                    status: true
                });
            }
            )
        }
        catch (err) {
            next(err);
        }
    },

    logout: async (req, res, next) => {
        try {
            // res.clearCookie("refreshToken");
            // const refreshTokens = await RefreshToken.find();
            // let listRefreshToken = refreshTokens.filter((x) => x.token !== req.cookies.refreshToken);
            // refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
            // return res.status(200).json({ message: 'Logged out success !' });
        }
        catch (err) {
            next(err);
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            const auth = await Customer.findOne({ $or: [{ phone: req.body.phone_email }, { email: req.body.phone_email }] });
            if (!auth) {
                return res.status(401).json({
                    message: "This account is not exists ! Please Register",
                    isExist: false
                });
            }
            else {
                const PHONE = req.body.phone_email;
                const OTP = otpGenerator.generate(6, {
                    digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
                });
                if (PHONE !== null && OTP !== null) {
                    const dataTemp = new Otp({ phone: PHONE, otp: OTP });
                    const result = await dataTemp.save();
                    return res.status(200).json({
                        message: "Send OTP Successfully",
                        data: {
                            phone_email: PHONE,
                            otp: OTP
                        },
                        status: true,
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtpPassword: async (req, res, next) => {
        try {
            const otpUser = await Otp.find({ phone: req.body.phone_email });
            if (otpUser.length === 0) {
                return res.status(401).json({ message: "Expired OTP ! Please Resend OTP" });
            }
            const lastOtp = otpUser[otpUser.length - 1];
            if ((lastOtp.phone === req.body.phone_email && lastOtp.otp === req.body.otp)) {
                const token = jwt.sign(
                    {
                        id: lastOtp.id,
                        phone: lastOtp.phone,
                    },
                    process.env.JWT_ACCESS_KEY,
                    { expiresIn: "1m" }
                );
                const deleteOTP = await Otp.deleteMany({ phone: lastOtp.phone_email });
                return res.status(200).json({
                    message: "OTP VALID",
                    phone_email: req.body.phone_email,
                    token: token,
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
            next(err);
        }
    },

    updatePassword: async (req, res, next) => {
        try {
            const user = await Customer.findOne({ $or: [{ phone: req.body.phone_email }, { email: req.body.phone_email }] });
            if (user) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(req.body.password, salt);
                await user.updateOne({ $set: { password: hashed } });
                return res.status(200).json({
                    message: "Update Password Successfully",
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "This account is not exists ! Please Register",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOTPEmail: async (req, res, next) => {
        try {
            const oldEmail = req.body.email;
            const EMAIL = req.body.new_email;
            const OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            if (EMAIL !== null && OTP !== null) {
                const dataTemp = new Otp({ email: EMAIL, otp: OTP });
                const result = await dataTemp.save();
                return res.status(200).json({
                    message: "Send OTP Successfully",
                    data: {
                        email: EMAIL,
                        otp: OTP
                    },
                    status: true,
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOTPEmail: async (req, res, next) => {
        try {
            const oldEmail = req.body.email;
            const otpUser = await Otp.find({ email: req.body.new_email });
            if (otpUser.length === 0) {
                return res.status(401).json({ message: "Expired OTP ! Please Resend OTP" });
            }
            const lastOtp = otpUser[otpUser.length - 1];
            if (lastOtp.email === req.body.new_email && lastOtp.otp === req.body.otp) {
                const token = jwt.sign(
                    {
                        id: lastOtp.id,
                        email: lastOtp.email,
                    },
                    process.env.JWT_ACCESS_KEY,
                    { expiresIn: "1m" }
                );
                const deleteOTP = await Otp.deleteMany({ email: lastOtp.email });
                return res.status(200).json({
                    message: "OTP VALID",
                    token: token,
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
            next(err);
        }
    },

    updateEmail: async (req, res, next) => {
        try {
            const token = req.body.token;
            const user = await Customer.findOne({ email: req.body.email });
            if (user) {
                await user.updateOne({ $set: { email: req.body.new_email } });
                return res.status(200).json({
                    message: "Update Email Successfully",
                    status: true
                });
            }
            else {
                return res.status(401).json({
                    message: "This account is not exists ! Please Register",
                    status: false
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

}

module.exports = AuthController;
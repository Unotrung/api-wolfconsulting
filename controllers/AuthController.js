const Customer = require('../models/eap_customers');
const Otp = require('../models/eap_otps');
const Blacklists = require('../models/eap_blacklist');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const dotenv = require('dotenv');
const sendMail = require('../helpers/sendMail');

dotenv.config();

const AuthController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                phone: user.phone
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "30m" }
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

    findUserInBlacklists: async (phone) => {
        let blacklists = await Blacklists.find();
        return blacklists.find(x => x.phone === phone);
    },

    findValidPhoneInCustomer: async (phone) => {
        let customers = await Customer.find();
        return customers.find(x => x.phone === phone);
    },

    findValidEmailInCustomer: async (email) => {
        let customers = await Customer.find();
        return customers.find(x => x.email === email);
    },

    generateOTP: (USERNAME, EMAIL, PHONE, OTP) => {
        return async (req, res) => {
            if (USERNAME !== null && USERNAME !== '' && EMAIL !== null && EMAIL !== '' && PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                let dataTemp = await new Otp({ username: USERNAME, email: EMAIL, phone: PHONE, otp: OTP, expiredAt: Date.now() + 1 * 60 * 1000 });
                let user = {
                    username: USERNAME,
                    email: EMAIL,
                    phone: PHONE
                }
                await dataTemp.save()
                    .then((data) => {
                        sendMail(EMAIL, "Get OTP From System Voolo", OTP);
                        return res.status(201).json({
                            message: "Send otp successfully",
                            status: true,
                            data: user
                        });
                    })
                    .catch((err) => {
                        return res.status(409).json({
                            message: "Send otp failure",
                            status: false,
                            errorStatus: err.status || 500,
                            errorMessage: err.message
                        })
                    });
            }
            else {
                return res.status(400).json({
                    message: "Please enter your username, phone, email. Do not leave any field blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
    },

    sendOtp: async (req, res, next) => {
        try {
            const USERNAME = req.body.username;
            const EMAIL = req.body.email;
            const PHONE = req.body.phone;
            const OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            if (USERNAME !== null && EMAIL !== null && PHONE !== null && USERNAME !== '' && EMAIL !== '' && PHONE !== '') {
                const isExists = await AuthController.findUserInBlacklists(PHONE);
                let validPhone = await AuthController.findValidPhoneInCustomer(PHONE);
                let validEmail = await AuthController.findValidEmailInCustomer(EMAIL);
                let message_phoneValid = {
                    message: "Phone is already exists. Please login !",
                    status: false,
                    statusCode: 2010
                };
                let message_email = {
                    message: "Email is already exists. Please login !",
                    status: false,
                    statusCode: 2011
                };
                if (isExists) {
                    if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                        return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004, countFail: 5 });
                    }
                    else if ((isExists.lockUntil && isExists.lockUntil < Date.now()) || (isExists.attempts > 0 && isExists.attempts < 5)) {
                        await Blacklists.deleteMany({ phone: PHONE });
                        if (validPhone) {
                            return res.status(409).json(message_phoneValid);
                        }
                        if (validEmail) {
                            return res.status(409).json(message_email);
                        }
                        if (!validPhone && !validEmail) {
                            await AuthController.generateOTP(USERNAME, EMAIL, PHONE, OTP)(req, res);
                        }
                    }
                }
                else {
                    await Blacklists.deleteMany({ phone: PHONE });
                    if (validPhone) {
                        return res.status(409).json(message_phoneValid);
                    }
                    if (validEmail) {
                        return res.status(409).json(message_email);
                    }
                    if (!validPhone && !validEmail) {
                        await AuthController.generateOTP(USERNAME, EMAIL, PHONE, OTP)(req, res);
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your username, your email and your phone. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005,
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtp: async (req, res, next) => {
        try {
            let EMAIL = req.body.email;
            let PHONE = req.body.phone;
            let USERNAME = req.body.username;
            let OTP = req.body.otp;
            let otp_expired = {
                message: "Expired otp. Please resend otp !",
                status: false,
                statusCode: 3000
            };
            if (USERNAME !== null && EMAIL !== null && PHONE !== null && USERNAME !== '' && EMAIL !== '' && PHONE !== '') {
                const otpUser = await Otp.find({ email: EMAIL, phone: PHONE, username: USERNAME });
                if (otpUser.length === 0) {
                    return res.status(401).json(otp_expired);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ phone: lastOtp.phone, email: lastOtp.email });
                        return res.status(401).json(otp_expired);
                    }
                    else {
                        if (lastOtp.phone === PHONE && lastOtp.email === EMAIL && lastOtp.otp === OTP) {
                            let user = { username: USERNAME, email: EMAIL, phone: PHONE };
                            await Blacklists.deleteMany({ phone: PHONE });
                            await Otp.deleteMany({ phone: lastOtp.phone, email: lastOtp.email });
                            return res.status(200).json({
                                message: "Successfully. OTP valid",
                                user: user,
                                status: true
                            });
                        }
                        else {
                            const isExists = await AuthController.findUserInBlacklists(PHONE);
                            if (isExists) {
                                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                                    return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004, countFail: 5 });
                                }
                                else if (isExists.attempts > 0 && isExists.attempts < 5) {
                                    await isExists.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { attempts: 1 } });
                                    return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure ${isExists.attempts + 1} times !`, status: false, statusCode: 4000, countFail: isExists.attempts + 1 });
                                }
                            }
                            else {
                                const blackPhone = await new Blacklists({ phone: PHONE, attempts: 1, lockUntil: Date.now() + 24 * 60 * 60 * 1000 });
                                await blackPhone.save((err) => {
                                    if (!err) {
                                        return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure 1 times !`, status: false, statusCode: 4000, countFail: 1 });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your username, your email and your phone. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    encryptPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    },

    register: async (req, res, next) => {
        try {
            let username = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password = req.body.password;
            if (username !== null && username !== '' && email !== null && email !== '' && phone !== null && phone !== '' && password !== null && password !== '') {
                const auths = await Customer.find();
                const auth = auths.find(x => x.phone === phone || x.email === email);
                if (auth) {
                    return res.status(409).json({
                        message: "This account is already exists. Please login !",
                        statusCode: 1000
                    });
                }
                else {
                    const hashed = await AuthController.encryptPassword(password);
                    const newUser = await new Customer({ username: username, email: email, phone: phone, password: hashed, verifyEmail: true });
                    await newUser.save((err, data) => {
                        if (!err) {
                            const { password, __v, refreshToken, loginAttempts, deleted, createdAt, updatedAt, ...others } = data._doc;
                            return res.status(201).json({
                                message: "Register successfully",
                                data: { ...others },
                                status: true
                            });
                        }
                        else {
                            return res.status(409).json({
                                message: "Register failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        }
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your username, email, phone and password. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            let PHONE_EMAIL = req.body.phone_email;
            let PASSWORD = req.body.password;
            if (PHONE_EMAIL !== null && PHONE_EMAIL !== '' && PASSWORD !== null && PASSWORD !== '') {
                const deletedUser = await Customer.findDeleted();
                const isBlock = deletedUser.find(x => x.deleted === Boolean(true) && x.deletedAt !== null);
                if (isBlock) {
                    return res.status(403).json({ message: "This phone/email is blocked by admin", status: false, statusCode: 1001 });
                }
                const auths = await Customer.find();
                const auth = auths.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                if (!auth) {
                    return res.status(404).json({ message: "Wrong phone/email. Please try again !", status: false, statusCode: 1002 });
                }
                else if (auth) {
                    if (auth?.lockUntil && auth?.lockUntil < Date.now()) {
                        await auth.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } })
                    }
                }
                const validPassword = await bcrypt.compare(PASSWORD, auth.password);
                if (!validPassword) {
                    if (auth?.loginAttempts === 5 && auth?.lockUntil > Date.now()) {
                        return res.status(403).json({ message: "You are logged in failure 5 times. Please wait 24 hours to login again !", status: false, statusCode: 1004, countFail: 5 });
                    }
                    else if (auth?.loginAttempts < 5) {
                        await auth.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { loginAttempts: 1 } });
                        return res.status(404).json({
                            message: `Wrong password. You are logged in failure ${auth.loginAttempts + 1} times`,
                            status: false,
                            statusCode: 1003,
                            countFail: auth.loginAttempts + 1
                        });
                    }
                }
                if (auth && validPassword && auth.loginAttempts !== 5) {
                    await auth.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } })
                    const accessToken = AuthController.generateAccessToken(auth);
                    const refreshToken = AuthController.generateRefreshToken(auth);
                    auth.refreshToken = refreshToken;
                    await auth.save()
                        .then((data) => {
                            const { password, loginAttempts, deleted, __v, createdAt, updatedAt, ...others } = data._doc;
                            return res.status(200).json({
                                message: "Login successfully",
                                data: { ...others },
                                token: accessToken,
                                status: true
                            });
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: "Login failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        })
                }
                else {
                    return res.status(403).json({ message: "You are logged in failure 5 times. Please wait 24 hours to login again !", status: false, statusCode: 1004, countFail: 5 });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your email/phone and password. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    getReRefreshToken: async (req, res, next) => {
        try {
            let id = req.params.id;
            if (id !== null && id !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.id === id);
                if (customer) {
                    const { password, __v, refreshToken, ...others } = customer._doc;
                    return res.status(200).json({
                        message: "Get refresh token successfully",
                        refreshToken: refreshToken,
                        status: true
                    });
                }
                else {
                    return res.status(409).json({
                        message: "Can not find this account !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your id. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    requestRefreshToken: async (req, res, next) => {
        try {
            let refreshToken = req.body.refreshToken;
            if (refreshToken !== null && refreshToken !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.refreshToken === refreshToken);
                if (customer) {
                    let newAccessToken = AuthController.generateAccessToken(customer);
                    let newRefreshToken = AuthController.generateRefreshToken(customer);
                    customer.refreshToken = newRefreshToken;
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: 'Update refreshToken successfully',
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: 'Update refreshToken failure',
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(409).json({
                        message: "Can not find this account to update !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your refreshToken. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    logout: async (req, res, next) => {
        try {
            let id = req.body.id;
            if (id !== null && id !== '') {
                const customers = await Customer.find();
                const customer = customers.find(x => x.id === id);
                if (customer) {
                    customer.refreshToken = null;
                    await customer.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: 'Log out successfully',
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: 'Log out failure',
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(409).json({
                        message: "Can not find this account to log out !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your id. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOtpPassword: (EMAIL, PHONE, OTP) => {
        return async (req, res) => {
            if (EMAIL !== null && EMAIL !== '' && PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                let dataTemp = await new Otp({ email: EMAIL, phone: PHONE, otp: OTP, expiredAt: Date.now() + 1 * 60 * 1000 });
                await dataTemp.save()
                    .then((data) => {
                        return res.status(201).json({
                            message: "Send otp successfully",
                            status: true,
                            email: EMAIL,
                            otp: OTP
                        });
                    })
                    .catch((err) => {
                        return res.status(409).json({
                            message: "Send otp failure",
                            status: false,
                            errorStatus: err.status || 500,
                            errorMessage: err.message
                        })
                    });
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone, email. Do not leave any field blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            let PHONE_EMAIL = req.body.phone_email;
            let OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            if (PHONE_EMAIL !== null && PHONE_EMAIL !== '') {
                const auths = await Customer.find();
                const auth = auths.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                if (!auth) {
                    return res.status(404).json({
                        message: "This account is not exists. Please register !",
                        status: false,
                        statusCode: 900
                    });
                }
                else {
                    const isExists = await AuthController.findUserInBlacklists(PHONE_EMAIL);
                    let phone = auth?.phone;
                    let email = auth?.email;
                    if (isExists) {
                        if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                            return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004, countFail: 5 });
                        }
                        else if ((isExists.lockUntil && isExists.lockUntil < Date.now()) || (isExists.attempts > 0 && isExists.attempts < 5)) {
                            await Blacklists.deleteMany({ phone: PHONE_EMAIL });
                            await AuthController.sendOtpPassword(email, phone, OTP)(req, res);
                        }
                    }
                    else {
                        await AuthController.sendOtpPassword(email, phone, OTP)(req, res);
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your email/phone. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOtpPassword: async (req, res, next) => {
        try {
            let PHONE_EMAIL = req.body.phone_email;
            let OTP = req.body.otp;
            let expired_otp = {
                message: "Expired otp. Please resend otp !",
                status: false,
                statusCode: 3000
            };
            if (PHONE_EMAIL !== null && OTP !== null && PHONE_EMAIL !== '' && OTP !== '') {
                const otpUser = await Otp.find({ $or: [{ phone: PHONE_EMAIL }, { email: PHONE_EMAIL }] });
                if (otpUser.length === 0) {
                    return res.status(401).json(expired_otp);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ $or: [{ phone: lastOtp.phone }, { email: lastOtp.email }] });
                        return res.status(401).json(expired_otp);
                    }
                    else {
                        if ((lastOtp.phone === PHONE_EMAIL || lastOtp.email === PHONE_EMAIL) && lastOtp.otp === OTP) {
                            const token = jwt.sign(
                                {
                                    id: lastOtp.id,
                                    phone: lastOtp.phone,
                                    email: lastOtp.email,
                                },
                                process.env.JWT_ACCESS_KEY,
                                { expiresIn: "1m" }
                            );
                            await Blacklists.deleteMany({ $or: [{ phone: lastOtp.phone }, { email: lastOtp.email }] });
                            await Otp.deleteMany({ $or: [{ phone: lastOtp.phone }, { email: lastOtp.email }] });
                            return res.status(200).json({
                                message: "Successfully. OTP valid",
                                token: token,
                                status: true
                            });
                        }
                        else {
                            const isExists = await AuthController.findUserInBlacklists(PHONE_EMAIL);
                            if (isExists) {
                                if (isExists.attempts === 5 && isExists.lockUntil > Date.now()) {
                                    return res.status(403).json({ message: "You have verified otp failure 5 times. Please wait 24 hours to try again !", status: false, statusCode: 1004, countFail: 5 });
                                }
                                else if (isExists.attempts > 0 && isExists.attempts < 5) {
                                    await isExists.updateOne({ $set: { lockUntil: Date.now() + 24 * 60 * 60 * 1000 }, $inc: { attempts: 1 } });
                                    return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure ${isExists.attempts + 1} times !`, status: false, statusCode: 4000, countFail: isExists.attempts + 1 });
                                }
                            }
                            else {
                                const blackPhone = await new Blacklists({ phone: PHONE_EMAIL, attempts: 1, lockUntil: Date.now() + 24 * 60 * 60 * 1000 });
                                await blackPhone.save((err) => {
                                    if (!err) {
                                        return res.status(404).json({ message: `Failure. OTP invalid. You are verified otp failure 1 times !`, status: false, statusCode: 4000, countFail: 1 });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your email/phone and OTP code. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            let PHONE_EMAIL = req.body.phone_email;
            let NEW_PASSWORD = req.body.password;
            if (PHONE_EMAIL !== null && NEW_PASSWORD !== null && PHONE_EMAIL !== '' && NEW_PASSWORD !== '') {
                const users = await Customer.find();
                const user = users.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                if (user) {
                    const hashed = await AuthController.encryptPassword(NEW_PASSWORD);
                    user.password = hashed;
                    await user.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: "Reset password successfully",
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: "Reset password failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message,
                            })
                        })
                }
                else {
                    return res.status(404).json({
                        message: "This account is not exists. Please register !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your phone/email and new password. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOTPEmail: async (req, res, next) => {
        try {
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '') {
                const emails = await Customer.find();
                const validEmail = emails.find(x => x.email === OLD_EMAIL);
                if (validEmail) {
                    const isExists = emails.find(x => x.email === NEW_EMAIL);
                    if (OLD_EMAIL !== NEW_EMAIL && !isExists) {
                        const dataTemp = await new Otp({ email: NEW_EMAIL, otp: OTP, expiredAt: Date.now() + 1 * 60 * 1000 });
                        await dataTemp.save((err) => {
                            if (!err) {
                                sendMail(NEW_EMAIL, "Get OTP From System Voolo", OTP);
                                return res.status(200).json({
                                    message: "Send otp successfully",
                                    email: NEW_EMAIL,
                                    status: true,
                                });
                            }
                            else {
                                return res.status(409).json({
                                    message: "Send otp failure",
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                });
                            }
                        });
                    }
                    else {
                        return res.status(409).json({
                            message: "This email is exists. Please try again !",
                            status: false,
                            statusCode: 1000
                        });
                    }
                }
                else {
                    return res.status(404).json({
                        message: "Can not find this email to update !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your old email and new email. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOTPEmail: async (req, res, next) => {
        try {
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const OTP = req.body.otp;
            let otp_expired = {
                message: "Expired otp. Please resend otp !",
                status: false,
                statusCode: 3000
            };
            if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '' && OTP !== null && OTP !== '') {
                const emails = await Customer.find();
                const validEmail = emails.find(x => x.email === OLD_EMAIL);
                if (validEmail) {
                    const otpUser = await Otp.find({ email: NEW_EMAIL });
                    if (otpUser.length === 0) {
                        return res.status(401).json(otp_expired);
                    }
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.expiredAt < Date.now()) {
                        await Otp.deleteMany({ email: lastOtp.email });
                        return res.status(401).json(otp_expired);
                    }
                    else {
                        if (lastOtp.email === NEW_EMAIL && lastOtp.otp === OTP) {
                            const token = jwt.sign(
                                {
                                    id: lastOtp.id,
                                    email: lastOtp.email,
                                },
                                process.env.JWT_ACCESS_KEY,
                                { expiresIn: "1m" }
                            );
                            await Otp.deleteMany({ email: lastOtp.email });
                            return res.status(200).json({
                                message: "Successfully. OTP valid",
                                email: NEW_EMAIL,
                                token: token,
                                status: true
                            });
                        }
                        else {
                            return res.status(404).json({
                                message: "Failure. OTP invalid",
                                status: false,
                                statusCode: 4000
                            });
                        }
                    }
                }
                else {
                    return res.status(404).json({
                        message: "Can not find this email to update !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your old email, new email and otp code. Do not leave any fields blank !",
                    status: false,
                    statusCode: 1005
                });
            }
        }
        catch (err) {
            next(err);
        }
    },

    updateEmail: async (req, res, next) => {
        try {
            const PHONE = req.body.phone;
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const token = req.body.token;
            if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '' && token !== null && token !== '') {
                const users = await Customer.find();
                const user = users.find(x => x.email === OLD_EMAIL);
                if (user) {
                    user.email = NEW_EMAIL;
                    await user.save()
                        .then((data) => {
                            return res.status(201).json({
                                message: "Update email successfully",
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: "Update email failure",
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(404).json({
                        message: "Can not find this email to update !",
                        status: false,
                        statusCode: 900
                    });
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your old email, new email and token. Do not leave any fields blank !",
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

module.exports = AuthController;
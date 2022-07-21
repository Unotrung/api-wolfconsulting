const Customer = require('../models/eap_customers');
const LockUser = require('../models/eap_lockusers');
const Otp = require('../models/eap_otps');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const sendMail = require('../helpers/sendMail');
const {
    MSG_GET_INFORMATION_NOT_EXISTS, MSG_SEND_OTP_SUCCESSFULLY, MSG_SEND_OTP_FAILURE, MSG_ENTER_ALL_FIELDS, MSG_SYSTEM_TITLE_OTP,
    MSG_PHONE_EXISTS, MSG_MAIL_EXISTS, MSG_EXPIRE_OTP, MSG_VERIFY_OTP_SUCCESSFULLY, MSG_VERIFY_OTP_FAILURE,
    MSG_ACCOUNT_EXISTS, MSG_REGISTER_SUCCESSFULLY, MSG_REGISTER_FAILURE, MSG_DEACTIVE_ACCOUNT, MSG_WRONG_EMAIL_PHONE,
    MSG_WRONG_PASSWORD, MSG_LOGIN_FAILURE_5_TIMES, MSG_LOGIN_SUCCESSFULLY, MSG_LOGIN_FAILURE, MSG_UPDATE_SUCCESSFULLY,
    MSG_UPDATE_FAILURE, MSG_LOGOUT_SUCCESSFULLY, MSG_LOGOUT_FAILURE, MSG_ACCOUNT_NOT_EXISTS_REGISTER, MSG_VERIFY_OTP_FAILURE_5_TIMES,
    MSG_EMAIL_IS_EXISTS, MSG_PHONE_IS_EXISTS, MSG_GET_REFRESH_TOKEN_SUCCESSFULLY, MSG_OLD_EMAIL_AND_NEW_EMAIL_MUST_NOT_BE_THE_SAME, MSG_OLD_PHONE_AND_NEW_PHONE_MUST_NOT_BE_THE_SAME
} = require('../config/response/response');
const { LOCK_TIME_OTP_FAILURE, LOCK_TIME_LOGIN_FAILURE } = require('../config/time/time');

const AuthController = {

    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                phone: user.phone
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '30m' }
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
            { expiresIn: '3h' }
        );
    },

    findValidPhoneInCustomer: async (phone) => {
        let customers = await Customer.find();
        return customers.find(x => x.phone === phone);
    },

    findValidEmailInCustomer: async (email) => {
        let customers = await Customer.find();
        return customers.find(x => x.email === email);
    },

    findLockUser: async (phone, email) => {
        let customers = await LockUser.find();
        return customers.find(x => x.phone === phone || x.email === email);
    },

    generateOTP: (USERNAME, EMAIL, PHONE, OTP) => {
        return async (req, res) => {
            if (USERNAME !== null && USERNAME !== '' && EMAIL !== null && EMAIL !== '' && PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                let dataTemp = await new Otp({ username: USERNAME, email: EMAIL, phone: PHONE, otp: OTP });
                let user = { username: USERNAME, email: EMAIL, phone: PHONE }
                await dataTemp.save()
                    .then(() => {
                        sendMail(EMAIL, MSG_SYSTEM_TITLE_OTP, OTP);
                        return res.status(201).json({ data: user, message: MSG_SEND_OTP_SUCCESSFULLY, status: true });
                    })
                    .catch((err) => {
                        return res.status(409).json({
                            message: MSG_SEND_OTP_FAILURE,
                            status: false,
                            errorStatus: err.status || 500,
                            errorMessage: err.message
                        })
                    });
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
    },

    sendOtp: async (req, res, next) => {
        try {
            const USERNAME = req.body.username;
            const EMAIL = req.body.email;
            const PHONE = req.body.phone;
            const OTP = otpGenerator.generate(6, { digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false });
            if (USERNAME !== null && EMAIL !== null && PHONE !== null && USERNAME !== '' && EMAIL !== '' && PHONE !== '') {
                let isLockUser = await AuthController.findLockUser(PHONE, EMAIL);
                let validPhone = await AuthController.findValidPhoneInCustomer(PHONE);
                let validEmail = await AuthController.findValidEmailInCustomer(EMAIL);
                let message_phoneValid = { message: MSG_PHONE_EXISTS, status: false, statusCode: 2010 };
                let message_emailValid = { message: MSG_MAIL_EXISTS, status: false, statusCode: 2011 };
                if (isLockUser) {
                    if (isLockUser.attempts === 5 && isLockUser.lockUntil > Date.now()) {
                        if (isLockUser.phone === PHONE && isLockUser.email === EMAIL) {
                            return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'both' });
                        }
                        else if (isLockUser.phone === PHONE) {
                            return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'phone' });
                        }
                        else if (isLockUser.email === EMAIL) {
                            return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'email' });
                        }
                    }
                    else if (isLockUser.lockUntil < Date.now()) {
                        await LockUser.deleteMany({ phone: PHONE, email: EMAIL });
                        if (validPhone) {
                            return res.status(409).json(message_phoneValid);
                        }
                        if (validEmail) {
                            return res.status(409).json(message_emailValid);
                        }
                        if (!validPhone && !validEmail) {
                            await AuthController.generateOTP(USERNAME, EMAIL, PHONE, OTP)(req, res);
                        }
                    }
                    else if (isLockUser.lockUntil > Date.now() && isLockUser.attempts < 5) {
                        await AuthController.generateOTP(USERNAME, EMAIL, PHONE, OTP)(req, res);
                    }
                }
                else {
                    if (validPhone) {
                        return res.status(409).json(message_phoneValid);
                    }
                    if (validEmail) {
                        return res.status(409).json(message_emailValid);
                    }
                    if (!validPhone && !validEmail) {
                        await AuthController.generateOTP(USERNAME, EMAIL, PHONE, OTP)(req, res);
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
            let otp_expired = { message: MSG_EXPIRE_OTP, status: false, statusCode: 3000 };
            if (USERNAME !== null && EMAIL !== null && PHONE !== null && USERNAME !== '' && EMAIL !== '' && PHONE !== '') {
                const otpUser = await Otp.find({ email: EMAIL, phone: PHONE, username: USERNAME });
                if (otpUser.length === 0) {
                    return res.status(401).json(otp_expired);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.phone === PHONE && lastOtp.email === EMAIL && lastOtp.otp === OTP) {
                        let user = { username: USERNAME, email: EMAIL, phone: PHONE };
                        await LockUser.deleteMany({ phone: PHONE, email: EMAIL });
                        await Otp.deleteMany({ phone: PHONE, email: EMAIL });
                        return res.status(200).json({ user: user, message: MSG_VERIFY_OTP_SUCCESSFULLY, status: true });
                    }
                    else {
                        const isLockUser = await AuthController.findLockUser(PHONE, EMAIL);
                        if (isLockUser) {
                            if (isLockUser.attempts === 5 && isLockUser.lockUntil > Date.now()) {
                                return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5 });
                            }
                            else if (isLockUser.attempts < 5) {
                                await isLockUser.updateOne({ $set: { lockUntil: LOCK_TIME_OTP_FAILURE }, $inc: { attempts: 1 } });
                                return res.status(404).json({ message: MSG_VERIFY_OTP_FAILURE, status: false, statusCode: 1004, countFail: isLockUser.attempts + 1 });
                            }
                        }
                        else {
                            const lockUser = await new LockUser({ phone: PHONE, email: EMAIL, attempts: 1, lockUntil: LOCK_TIME_OTP_FAILURE });
                            await lockUser.save((err) => {
                                if (!err) {
                                    return res.status(404).json({ message: MSG_VERIFY_OTP_FAILURE, status: false, statusCode: 1004, countFail: 1 });
                                }
                            });
                        }
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    encryptPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    },

    register: async (req, res, next) => {
        try {
            let username = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password = req.body.password;
            if (username !== null && username !== '' && email !== null && email !== '' && phone !== null && phone !== '' && password !== null && password !== '') {
                const isLockUser = await AuthController.findLockUser(phone, email);
                if (isLockUser) {
                    if (isLockUser.attempts === 5 && isLockUser.lockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5 });
                    }
                }
                else {
                    const auths = await Customer.find();
                    const auth = auths.find(x => x.phone === phone || x.email === email);
                    if (auth) {
                        return res.status(409).json({ message: MSG_ACCOUNT_EXISTS, statusCode: 1000 });
                    }
                    else {
                        const hashed = await AuthController.encryptPassword(password);
                        const newUser = await new Customer({ username: username, email: email, phone: phone, password: hashed, verifyEmail: true });
                        await newUser.save((err, data) => {
                            if (!err) {
                                const { password, __v, refreshToken, loginAttempts, otpPasswordAttempts, otpEmailAttempts, otpPhoneAttempts, deleted, createdAt, updatedAt, ...others } = data._doc;
                                return res.status(201).json({
                                    data: { ...others },
                                    message: MSG_REGISTER_SUCCESSFULLY,
                                    status: true
                                });
                            }
                            else {
                                return res.status(409).json({
                                    message: MSG_REGISTER_FAILURE,
                                    status: false,
                                    errorStatus: err.status || 500,
                                    errorMessage: err.message
                                });
                            }
                        });
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
                const isDeactive = deletedUser.find(x => x.deleted === Boolean(true) && x.deletedAt !== null);
                if (isDeactive) {
                    return res.status(403).json({ message: MSG_DEACTIVE_ACCOUNT, status: false, statusCode: 1001 });
                }
                const auths = await Customer.find();
                const auth = auths.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                if (!auth) {
                    return res.status(404).json({ message: MSG_WRONG_EMAIL_PHONE, status: false, statusCode: 1002 });
                }
                else if (auth) {
                    if (auth.loginLockUntil < Date.now()) {
                        await auth.updateOne({ $set: { loginAttempts: 0 }, $unset: { loginLockUntil: 1 } })
                    }
                    if (auth.otpPasswordLockUntil < Date.now()) {
                        await auth.updateOne({ $set: { otpPasswordAttempts: 0 }, $unset: { otpPasswordLockUntil: 1 } })
                    }
                    if (auth.otpEmailLockUntil < Date.now()) {
                        await auth.updateOne({ $set: { otpEmailAttempts: 0 }, $unset: { otpEmailLockUntil: 1 } })
                    }
                    if (auth.otpPhoneLockUntil < Date.now()) {
                        await auth.updateOne({ $set: { otpPhoneAttempts: 0 }, $unset: { otpPhoneLockUntil: 1 } })
                    }
                }
                const validPassword = await bcrypt.compare(PASSWORD, auth.password);
                if (!validPassword) {
                    if (auth.loginAttempts === 5 && auth.loginLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_LOGIN_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5 });
                    }
                    else if (auth.loginAttempts < 5) {
                        await auth.updateOne({ $set: { loginLockUntil: LOCK_TIME_LOGIN_FAILURE }, $inc: { loginAttempts: 1 } });
                        return res.status(404).json({ message: MSG_WRONG_PASSWORD, status: false, statusCode: 1004, countFail: auth.loginAttempts + 1 });
                    }
                }
                if (auth && validPassword && auth.loginAttempts !== 5) {
                    await auth.updateOne({ $set: { loginAttempts: 0 }, $unset: { loginLockUntil: 1 } });
                    if (auth.otpPasswordAttempts === 5 && auth.otpPasswordLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_password' });
                    }
                    if (auth.otpEmailAttempts === 5 && auth.otpEmailLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_email' });
                    }
                    if (auth.otpPhoneAttempts === 5 && auth.otpPhoneLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_phone' });
                    }
                    const accessToken = AuthController.generateAccessToken(auth);
                    const refreshToken = AuthController.generateRefreshToken(auth);
                    auth.refreshToken = refreshToken;
                    await auth.save()
                        .then((data) => {
                            const { password, loginAttempts, otpPasswordAttempts, otpEmailAttempts, otpPhoneAttempts, deleted, __v, createdAt, updatedAt, ...others } = data._doc;
                            return res.status(200).json({
                                data: { ...others },
                                token: accessToken,
                                message: MSG_LOGIN_SUCCESSFULLY,
                                status: true
                            });
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_LOGIN_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        })
                }
                else {
                    return res.status(403).json({ message: MSG_LOGIN_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
                    const { refreshToken, ...others } = customer._doc;
                    return res.status(200).json({
                        refreshToken: refreshToken,
                        message: MSG_GET_REFRESH_TOKEN_SUCCESSFULLY,
                        status: true
                    });
                }
                else {
                    return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
                        .then(() => {
                            return res.status(201).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
                        .then(() => {
                            return res.status(201).json({
                                message: MSG_LOGOUT_SUCCESSFULLY,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_LOGOUT_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOtpPassword: (EMAIL, PHONE, OTP) => {
        return async (req, res) => {
            if (EMAIL !== null && EMAIL !== '' && PHONE !== null && PHONE !== '' && OTP !== null && OTP !== '') {
                let dataTemp = await new Otp({ email: EMAIL, phone: PHONE, otp: OTP });
                await dataTemp.save()
                    .then(() => {
                        sendMail(EMAIL, MSG_SYSTEM_TITLE_OTP, OTP);
                        return res.status(201).json({ email: EMAIL, message: MSG_SEND_OTP_SUCCESSFULLY, status: true });
                    })
                    .catch((err) => {
                        return res.status(409).json({
                            message: MSG_SEND_OTP_FAILURE,
                            status: false,
                            errorStatus: err.status || 500,
                            errorMessage: err.message
                        })
                    });
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            let PHONE_EMAIL = req.body.phone_email;
            let OTP = otpGenerator.generate(6, { digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false });
            if (PHONE_EMAIL !== null && PHONE_EMAIL !== '') {
                const auths = await Customer.find();
                const auth = auths.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                if (!auth) {
                    return res.status(404).json({ message: MSG_ACCOUNT_NOT_EXISTS_REGISTER, status: false, statusCode: 900 });
                }
                else {
                    let phone = auth.phone;
                    let email = auth.email;
                    if (auth.otpPasswordAttempts === 5 && auth.otpPasswordLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_password' });
                    }
                    if (auth.otpEmailAttempts === 5 && auth.otpEmailLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_email' });
                    }
                    if (auth.otpPhoneAttempts === 5 && auth.otpPhoneLockUntil > Date.now()) {
                        return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_phone' });
                    }
                    if (auth.otpPasswordLockUntil < Date.now()) {
                        await auth.updateOne({ $set: { otpPasswordAttempts: 0 }, $unset: { otpPasswordLockUntil: 1 } })
                    }
                    await AuthController.sendOtpPassword(email, phone, OTP)(req, res);
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
            let expired_otp = { message: MSG_EXPIRE_OTP, status: false, statusCode: 3000 };
            if (PHONE_EMAIL !== null && OTP !== null && PHONE_EMAIL !== '' && OTP !== '') {
                const otpUser = await Otp.find({ $or: [{ phone: PHONE_EMAIL }, { email: PHONE_EMAIL }] });
                if (otpUser.length === 0) {
                    return res.status(401).json(expired_otp);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
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
                        await Otp.deleteMany({ $or: [{ phone: lastOtp.phone }, { email: lastOtp.email }] });
                        return res.status(200).json({ token: token, message: MSG_VERIFY_OTP_SUCCESSFULLY, status: true });
                    }
                    else {
                        const auths = await Customer.find();
                        const auth = auths.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                        if (auth.otpPasswordAttempts === 5 && auth.otpPasswordLockUntil > Date.now()) {
                            return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_password' });
                        }
                        if (auth.otpPasswordAttempts < 5) {
                            await auth.updateOne({ $set: { otpPasswordLockUntil: LOCK_TIME_OTP_FAILURE }, $inc: { otpPasswordAttempts: 1 } })
                            return res.status(404).json({ message: MSG_VERIFY_OTP_FAILURE, status: false, statusCode: 1004, countFail: auth.otpPasswordAttempts + 1, type: 'otp_password' });
                        }
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
                        .then(() => {
                            return res.status(201).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message,
                            })
                        })
                }
                else {
                    return res.status(404).json({ message: MSG_ACCOUNT_NOT_EXISTS_REGISTER, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkEmailExists: (OLD_EMAIL, NEW_EMAIL, OTP) => {
        return async (req, res) => {
            const emails = await Customer.find();
            const validEmail = emails.find(x => x.email === OLD_EMAIL);
            if (validEmail) {
                const isExists = emails.find(x => x.email === NEW_EMAIL);
                if (isExists) {
                    return res.status(409).json({ message: MSG_EMAIL_IS_EXISTS, status: true, statusCode: 5002 });
                }
                if (OLD_EMAIL !== NEW_EMAIL && !isExists) {
                    const dataTemp = await new Otp({ email: NEW_EMAIL, otp: OTP });
                    await dataTemp.save((err) => {
                        if (!err) {
                            sendMail(NEW_EMAIL, MSG_SYSTEM_TITLE_OTP, OTP);
                            return res.status(200).json({ email: NEW_EMAIL, message: MSG_SEND_OTP_SUCCESSFULLY, status: true });
                        }
                        else {
                            return res.status(409).json({
                                message: MSG_SEND_OTP_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        }
                    });
                }
                else {
                    return res.status(409).json({ message: MSG_OLD_EMAIL_AND_NEW_EMAIL_MUST_NOT_BE_THE_SAME, status: false, statusCode: 5001 });
                }
            }
            else {
                return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
            }
        }
    },

    sendOTPUpdateEmail: async (req, res, next) => {
        try {
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const OTP = otpGenerator.generate(6, { digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false });
            if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '') {
                const auths = await Customer.find();
                const auth = auths.find(x => x.email === OLD_EMAIL);
                if (auth.otpPasswordAttempts === 5 && auth.otpPasswordLockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_password' });
                }
                if (auth.otpEmailAttempts === 5 && auth.otpEmailLockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_email' });
                }
                if (auth.otpPhoneAttempts === 5 && auth.otpPhoneLockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_phone' });
                }
                if (auth.otpEmailLockUntil < Date.now()) {
                    await auth.updateOne({ $set: { otpEmailAttempts: 0 }, $unset: { otpEmailLockUntil: 1 } })
                }
                await AuthController.checkEmailExists(OLD_EMAIL, NEW_EMAIL, OTP)(req, res);
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOTPUpdateEmail: async (req, res, next) => {
        try {
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const OTP = req.body.otp;
            let otp_expired = { message: MSG_EXPIRE_OTP, status: false, statusCode: 3000 };
            if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '' && OTP !== null && OTP !== '') {
                const otpUser = await Otp.find({ email: NEW_EMAIL });
                if (otpUser.length === 0) {
                    return res.status(401).json(otp_expired);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.email === NEW_EMAIL && lastOtp.otp === OTP) {
                        const token = jwt.sign(
                            {
                                id: lastOtp.id,
                                email: lastOtp.email,
                            },
                            process.env.JWT_ACCESS_KEY,
                            { expiresIn: '1m' }
                        );
                        await Otp.deleteMany({ email: lastOtp.email });
                        return res.status(200).json({
                            email: NEW_EMAIL,
                            token: token,
                            message: MSG_VERIFY_OTP_SUCCESSFULLY,
                            status: true
                        });
                    }
                    else {
                        const auths = await Customer.find();
                        const auth = auths.find(x => x.email === OLD_EMAIL);
                        if (auth.otpEmailAttempts === 5 && auth.otpEmailLockUntil > Date.now()) {
                            return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_email' });
                        }
                        if (auth.otpEmailAttempts < 5) {
                            await auth.updateOne({ $set: { otpEmailLockUntil: LOCK_TIME_OTP_FAILURE }, $inc: { otpEmailAttempts: 1 } })
                            return res.status(404).json({ message: MSG_VERIFY_OTP_FAILURE, status: false, statusCode: 1004, countFail: auth.otpEmailAttempts + 1, type: 'otp_email' });
                        }
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
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
                        .then(() => {
                            return res.status(201).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    checkPhoneExists: (OLD_PHONE, NEW_PHONE, OTP) => {
        return async (req, res) => {
            const phones = await Customer.find();
            const validPhone = phones.find(x => x.phone === OLD_PHONE);
            if (validPhone) {
                const isExists = phones.find(x => x.phone === NEW_PHONE);
                if (isExists) {
                    return res.status(409).json({ message: MSG_PHONE_IS_EXISTS, status: true, statusCode: 5002 });
                }
                if (OLD_PHONE !== NEW_PHONE && !isExists) {
                    const dataTemp = await new Otp({ phone: NEW_PHONE, otp: OTP });
                    await dataTemp.save((err) => {
                        if (!err) {
                            return res.status(200).json({ phone: NEW_PHONE, otp: OTP, message: MSG_SEND_OTP_SUCCESSFULLY, status: true });
                        }
                        else {
                            return res.status(409).json({
                                message: MSG_SEND_OTP_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            });
                        }
                    });
                }
                else {
                    return res.status(409).json({ message: MSG_OLD_PHONE_AND_NEW_PHONE_MUST_NOT_BE_THE_SAME, status: false, statusCode: 5001 });
                }
            }
            else {
                return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
            }
        }
    },

    sendOTPUpdatePhone: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let new_phone = req.body.new_phone;
            let OTP = otpGenerator.generate(6, { digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false });
            if (phone !== null && phone !== "" && new_phone !== null && new_phone !== "") {
                const auths = await Customer.find();
                const auth = auths.find(x => x.phone === phone);
                if (auth.otpPasswordAttempts === 5 && auth.otpPasswordLockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_password' });
                }
                if (auth.otpEmailAttempts === 5 && auth.otpEmailLockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_email' });
                }
                if (auth.otpPhoneAttempts === 5 && auth.otpPhoneLockUntil > Date.now()) {
                    return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_phone' });
                }
                if (auth.otpPhoneLockUntil < Date.now()) {
                    await auth.updateOne({ $set: { otpPhoneAttempts: 0 }, $unset: { otpPhoneLockUntil: 1 } })
                }
                await AuthController.checkPhoneExists(phone, new_phone, OTP)(req, res);
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOTPUpdatePhone: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let new_phone = req.body.new_phone;
            let otp = req.body.otp;
            let otp_expired = { message: MSG_EXPIRE_OTP, status: false, statusCode: 3000 };
            if (phone !== null && phone !== "" && new_phone !== null && new_phone !== "" && otp !== null && otp !== "") {
                const otpUser = await Otp.find({ phone: new_phone });
                if (otpUser.length === 0) {
                    return res.status(401).json(otp_expired);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.phone === new_phone && lastOtp.otp === otp) {
                        let token = jwt.sign(
                            {
                                id: lastOtp.id,
                                phone: lastOtp.phone
                            },
                            process.env.JWT_ACCESS_KEY,
                            { expiresIn: '1m' }
                        );
                        await Otp.deleteMany({ phone: lastOtp.phone });
                        return res.status(200).json({
                            phone: new_phone,
                            token: token,
                            message: MSG_VERIFY_OTP_SUCCESSFULLY,
                            status: true
                        });
                    }
                    else {
                        const auths = await Customer.find();
                        const auth = auths.find(x => x.phone === phone);
                        if (auth.otpPhoneAttempts === 5 && auth.otpPhoneLockUntil > Date.now()) {
                            return res.status(403).json({ message: MSG_VERIFY_OTP_FAILURE_5_TIMES, status: false, statusCode: 1004, countFail: 5, type: 'otp_phone' });
                        }
                        if (auth.otpPhoneAttempts < 5) {
                            await auth.updateOne({ $set: { otpPhoneLockUntil: LOCK_TIME_OTP_FAILURE }, $inc: { otpPhoneAttempts: 1 } })
                            return res.status(404).json({ message: MSG_VERIFY_OTP_FAILURE, status: false, statusCode: 1004, countFail: auth.otpPhoneAttempts + 1, type: 'otp_phone' });
                        }
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    updatePhone: async (req, res, next) => {
        try {
            const PHONE = req.body.phone;
            const NEW_PHONE = req.body.new_phone;
            const token = req.body.token;
            if (PHONE !== null && NEW_PHONE !== null && PHONE !== '' && NEW_PHONE !== '' && token !== null && token !== '') {
                const users = await Customer.find();
                const user = users.find(x => x.phone === PHONE);
                if (user) {
                    user.phone = NEW_PHONE;
                    await user.save()
                        .then(() => {
                            return res.status(201).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOTPPhone: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let OTP = otpGenerator.generate(6, { digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false });
            if (phone !== null && phone !== "") {
                const user = await AuthController.findValidPhoneInCustomer(phone);
                if (user) {
                    let dataTemp = await new Otp({ phone: phone, otp: OTP });
                    await dataTemp.save()
                        .then(() => {
                            return res.status(201).json({
                                otp: OTP,
                                message: MSG_SEND_OTP_SUCCESSFULLY,
                                status: true
                            });
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_SEND_OTP_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        });
                }
                else {
                    return res.status(404).json({ message: MSG_ACCOUNT_NOT_EXISTS_REGISTER, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOTPPhone: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            let otp = req.body.otp;
            let otp_expired = { message: MSG_EXPIRE_OTP, status: false, statusCode: 3000 };
            if (phone !== null && phone !== "" && otp !== null && otp !== "") {
                const otpUser = await Otp.find({ phone: phone });
                if (otpUser.length === 0) {
                    return res.status(401).json(otp_expired);
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.phone === phone && lastOtp.otp === otp) {
                        await Otp.deleteMany({ phone: lastOtp.phone });
                        return res.status(200).json({
                            phone: phone,
                            message: MSG_VERIFY_OTP_SUCCESSFULLY,
                            status: true
                        });
                    }
                    else {
                        return res.status(404).json({ message: MSG_VERIFY_OTP_FAILURE, status: false, statusCode: 1004 });
                    }
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

    updateVerifyPhone: async (req, res, next) => {
        try {
            let phone = req.body.phone;
            if (phone !== null && phone !== "") {
                const user = await AuthController.findValidPhoneInCustomer(phone);
                if (user) {
                    user.verifyPhone = true;
                    await user.save()
                        .then(() => {
                            return res.status(201).json({
                                message: MSG_UPDATE_SUCCESSFULLY,
                                status: true
                            })
                        })
                        .catch((err) => {
                            return res.status(409).json({
                                message: MSG_UPDATE_FAILURE,
                                status: false,
                                errorStatus: err.status || 500,
                                errorMessage: err.message
                            })
                        })
                }
                else {
                    return res.status(404).json({ message: MSG_GET_INFORMATION_NOT_EXISTS, status: false, statusCode: 900 });
                }
            }
            else {
                return res.status(400).json({ message: MSG_ENTER_ALL_FIELDS, status: false, statusCode: 1005 });
            }
        }
        catch (err) {
            next(err);
        }
    },

}

module.exports = AuthController;
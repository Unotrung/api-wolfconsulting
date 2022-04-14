const Customer = require('../models/eap_customers');
const Otp = require('../models/eap_otps');
const RefreshToken = require('../models/eap_refreshtokens');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const sendMail = require('../helpers/sendMail');
const { validationResult } = require('express-validator');

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
            const USERNAME = req.body.username;
            const EMAIL = req.body.email;
            const PHONE = req.body.phone;
            const OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (USERNAME !== null && EMAIL !== null && PHONE !== null && USERNAME !== '' && EMAIL !== '' && PHONE !== '') {
                    const customers = await Customer.find();
                    const customer = customers.find(x => x.phone === PHONE || x.email === EMAIL);
                    if (customer) {
                        return res.status(409).json({
                            message: "Email/Phone is already exists. Please login !",
                            status: false
                        });
                    }
                    else {
                        const dataTemp = await new Otp({ username: USERNAME, email: EMAIL, phone: PHONE, otp: OTP });
                        await dataTemp.save()
                            .then((data) => {
                                const { otp, __v, ...others } = data._doc;
                                sendMail(EMAIL, "Get OTP From System Voolo", OTP);
                                return res.status(201).json({
                                    message: "Send otp successfully",
                                    data: { ...others },
                                    status: true
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
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your username, your email and your phone. Do not leave any fields blank !",
                        status: false
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
            let EMAIL = req.body.email;
            let PHONE = req.body.phone;
            let USERNAME = req.body.username;
            let OTP = req.body.otp;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (USERNAME !== null && EMAIL !== null && PHONE !== null && USERNAME !== '' && EMAIL !== '' && PHONE !== '') {
                    const otpUser = await Otp.find({ email: EMAIL, phone: PHONE, username: USERNAME });
                    if (otpUser.length === 0) {
                        return res.status(401).json({
                            message: "Expired otp. Please resend otp !",
                            status: false
                        });
                    }
                    const lastOtp = otpUser[otpUser.length - 1];
                    if (lastOtp.phone === PHONE && lastOtp.email === EMAIL && lastOtp.otp === OTP) {
                        let user = {
                            username: USERNAME,
                            email: EMAIL,
                            phone: PHONE
                        };
                        await Otp.deleteMany({ phone: lastOtp.phone, email: lastOtp.email });
                        return res.status(200).json({
                            message: "Successfully. OTP valid",
                            user: user,
                            status: true
                        });
                    }
                    else {
                        return res.status(404).json({
                            message: "Failure. OTP invalid",
                            status: false
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your username, your email and your phone. Do not leave any fields blank !",
                        status: false
                    });
                }
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
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (username !== null && username !== '' && email !== null && email !== '' && phone !== null && phone !== '' && password !== null && password !== '') {
                    const auths = await Customer.find();
                    const auth = auths.find(x => x.phone === phone || x.email === email);
                    if (auth) {
                        return res.status(409).json({
                            message: "This account is already exists. Please login !",
                        });
                    }
                    else {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(password, salt);
                        const newUser = await new Customer({
                            username: username,
                            email: email,
                            phone: phone,
                            password: hashed
                        });
                        await newUser.save((err, data) => {
                            if (!err) {
                                const { password, __v, ...others } = data._doc;
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
                        status: false
                    });
                }
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
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE_EMAIL !== null && PHONE_EMAIL !== '' && PASSWORD !== null && PASSWORD !== '') {
                    const auths = await Customer.find();
                    const auth = auths.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                    if (!auth) {
                        return res.status(404).json({ message: "Wrong phone. Please try again !", status: false });
                    }
                    const validPassword = await bcrypt.compare(PASSWORD, auth.password);
                    if (!validPassword) {
                        return res.status(404).json({ message: "Wrong pin. Please try again !", status: false });
                    }
                    if (auth && validPassword) {
                        const accessToken = AuthController.generateAccessToken(auth);
                        const refreshToken = AuthController.generateRefreshToken(auth);
                        const refreshTokens = await new RefreshToken({ refreshToken: refreshToken });
                        await refreshTokens.save();
                        res.cookie("refreshToken", refreshToken, {
                            httpOnly: true,
                            secure: false,
                            path: '/',
                            sameSite: 'strict',
                        });
                        const { password, __v, ...others } = auth._doc;
                        return res.status(200).json({
                            message: "Login successfully",
                            data: { ...others },
                            token: accessToken,
                            status: true
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your email/phone and password. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    // requestRefreshToken: async (req, res, next) => {
    //     try {
    //         // Get refreshToken from cookie
    //         const refreshToken = req.cookies.refreshToken;
    //         const refreshTokens = await RefreshToken.find();
    //         console.log("RefreshTokens Find: ", refreshTokens);
    //         if (!refreshToken) {
    //             return res.status(401).json('You are not authenticated');
    //         }
    //         let data = refreshTokens.find((x) => x.refreshToken === refreshToken);
    //         console.log("Data: ", data);
    //         if (!data) {
    //             return res.status(403).json('Refresh Token is not valid');
    //         }
    //         jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //             let listRefreshToken = refreshTokens.filter((x) => x.refreshToken !== refreshToken);
    //             console.log("List RefreshToken: ", listRefreshToken);
    //             const newAccessToken = AuthController.generateAccessToken(user);
    //             const newRefreshToken = AuthController.generateRefreshToken(user);
    //             await RefreshToken.updateOne({ refreshToken: data.refreshToken }, { refreshToken: newRefreshToken });
    //             res.cookie("refreshToken", newRefreshToken, {
    //                 httpOnly: true,
    //                 secure: false,
    //                 path: '/',
    //                 sameSite: 'strict',
    //             });
    //             return res.status(200).json({
    //                 token: newAccessToken,
    //                 status: true
    //             });
    //         }
    //         )
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    // logout: async (req, res, next) => {
    //     try {
    //         // res.clearCookie("refreshToken");
    //         // const refreshTokens = await RefreshToken.find();
    //         // let listRefreshToken = refreshTokens.filter((x) => x.token !== req.cookies.refreshToken);
    //         // refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
    //         // return res.status(200).json({ message: 'Logged out success !' });
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

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
                        status: false
                    });
                }
                else {
                    const dataTemp = await new Otp({ phone: PHONE_EMAIL, otp: OTP });
                    await dataTemp.save((err) => {
                        if (!err) {
                            sendMail(PHONE_EMAIL, "Get OTP From System Voolo", OTP);
                            return res.status(201).json({
                                message: "Send otp successfully",
                                phone_email: PHONE_EMAIL,
                                status: true
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
            }
            else {
                return res.status(400).json({
                    message: "Please enter your email/phone. Do not leave any fields blank !",
                    status: false
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
            if (PHONE_EMAIL !== null && OTP !== null && PHONE_EMAIL !== '' && OTP !== '') {
                const otpUser = await Otp.find({ phone: PHONE_EMAIL });
                if (otpUser.length === 0) {
                    return res.status(401).json({
                        message: "Expired otp. Please resend otp !",
                        status: false
                    });
                }
                else {
                    const lastOtp = otpUser[otpUser.length - 1];
                    if ((lastOtp.phone === PHONE_EMAIL && lastOtp.otp === OTP)) {
                        const token = jwt.sign(
                            {
                                id: lastOtp.id,
                                phone: lastOtp.phone,
                                email: lastOtp.phone,
                            },
                            process.env.JWT_ACCESS_KEY,
                            { expiresIn: "1m" }
                        );
                        await Otp.deleteMany({ phone: lastOtp.phone });
                        return res.status(200).json({
                            message: "Successfully. OTP valid",
                            phone_email: PHONE_EMAIL,
                            token: token,
                            status: true
                        });
                    }
                    else {
                        return res.status(404).json({
                            message: "Failure. OTP invalid",
                            status: false
                        });
                    }
                }
            }
            else {
                return res.status(400).json({
                    message: "Please enter your email/phone and OTP code. Do not leave any fields blank !",
                    status: false
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
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (PHONE_EMAIL !== null && NEW_PASSWORD !== null && PHONE_EMAIL !== '' && NEW_PASSWORD !== '') {
                    const users = await Customer.find();
                    const user = users.find(x => x.phone === PHONE_EMAIL || x.email === PHONE_EMAIL);
                    if (user) {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(NEW_PASSWORD, salt);
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
                        return res.status(400).json({
                            message: "This account is not exists. Please register !",
                            status: false
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your phone/email and new password. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    sendOTPEmail: async (req, res, next) => {
        try {
            const PHONE = req.body.phone;
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const OTP = otpGenerator.generate(6, {
                digits: true, specialChars: false, upperCaseAlphabets: false, lowerCaseAlphabets: false
            });
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '') {
                    const emails = await Customer.find();
                    const validEmail = emails.find(x => x.email === OLD_EMAIL);
                    if (validEmail) {
                        const dataTemp = new Otp({ email: NEW_EMAIL, otp: OTP });
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
                                });
                            }
                        });
                    }
                    else {
                        return res.status(404).json({
                            message: "Can not find this email to update !",
                            status: false
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your old email and new email. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyOTPEmail: async (req, res, next) => {
        try {
            const PHONE = req.body.phone;
            const OLD_EMAIL = req.body.email;
            const NEW_EMAIL = req.body.new_email;
            const OTP = req.body.otp;
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
                if (OLD_EMAIL !== null && NEW_EMAIL !== null && OLD_EMAIL !== '' && NEW_EMAIL !== '' && OTP !== null && OTP !== '') {
                    const emails = await Customer.find();
                    const validEmail = emails.find(x => x.email === OLD_EMAIL);
                    if (validEmail) {
                        const otpUser = await Otp.find({ email: NEW_EMAIL });
                        if (otpUser.length === 0) {
                            return res.status(401).json({
                                message: "Expired otp. Please resend otp !",
                                status: false
                            });
                        }
                        const lastOtp = otpUser[otpUser.length - 1];
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
                                status: false
                            });
                        }
                    }
                    else {
                        return res.status(404).json({
                            message: "Can not find this email to update !",
                            status: false
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your old email, new email and otp code. Do not leave any fields blank !",
                        status: false
                    });
                }
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
            const validData = validationResult(req);
            if (validData.errors.length > 0) {
                return res.status(400).json({
                    message: validData.errors[0].msg,
                    status: false
                });
            }
            else {
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
                            status: false
                        });
                    }
                }
                else {
                    return res.status(400).json({
                        message: "Please enter your old email, new email and token. Do not leave any fields blank !",
                        status: false
                    });
                }
            }
        }
        catch (err) {
            next(err);
        }
    },

}

module.exports = AuthController;
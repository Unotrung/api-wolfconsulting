const AuthController = require("../controllers/AuthController");
const MiddlewareController = require("../controllers/MiddlewareController");
const { check } = require('express-validator');
const router = require("express").Router();

const formatPhone = /^(09|03|07|08|05)+([0-9]{8}$)/;
const formatPassword = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&~^\-+_\(\)]{6,}$/;
const errMessagePhone = 'Invalid phone number format';
const errMessageMail = 'Invalid email format';
const errMessageNewMail = 'Invalid new email format';
const errMessagePassword = 'Password must contain at least 1 uppercase letter and 1 number. The minimum password length is 6';

router.post("/sendOtp",
    [
        check('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),

        check('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        check('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    AuthController.sendOtp);

router.post("/verifyOtp",
    [
        check('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),

        check('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        check('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    AuthController.verifyOtp);

router.post("/register",
    [
        check('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),

        check('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        check('phone').matches(formatPhone).withMessage(errMessagePhone),

        check('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    AuthController.register);

router.post("/login",
    [
        check('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    AuthController.login);
// router.get("/:id/requestRefreshToken", MiddlewareController.VerifyTokenByMySelf, AuthController.requestRefreshToken);
// router.get("/logout", MiddlewareController.verifyToken, AuthController.logout);
router.post("/forgotPassword", AuthController.forgotPassword);

router.post("/verifyOtpPassword", AuthController.verifyOtpPassword);

router.put("/resetPassword",
    [
        check('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    MiddlewareController.verifyTokenByMySelf, AuthController.resetPassword);

router.post("/sendOTPEmail",
    [
        check('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        check('new_email')
            .isLength({ min: 13 }).withMessage('Minimum length of new email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of new email is 255')
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.verifyTokenByMySelf, AuthController.sendOTPEmail);

router.post("/verifyOTPEmail",
    [
        check('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        check('new_email')
            .isLength({ min: 13 }).withMessage('Minimum length of new email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of new email is 255')
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.verifyTokenByMySelf, AuthController.verifyOTPEmail);

router.put("/updateEmail",
    [
        check('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        check('new_email')
            .isLength({ min: 13 }).withMessage('Minimum length of new email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of new email is 255')
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.verifyTokenByMySelfBody, AuthController.updateEmail);

module.exports = router;
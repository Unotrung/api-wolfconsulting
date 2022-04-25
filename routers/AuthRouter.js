const AuthController = require("../controllers/AuthController");
const MiddlewareController = require("../controllers/MiddlewareController");
const { check, body } = require('express-validator');
const router = require("express").Router();

const formatPhone = /^(09|03|07|08|05)+([0-9]{8}$)/;
const formatPassword = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&~^\-+_\(\)]{6,}$/;
const errMessagePhone = 'Invalid phone number format';
const errMessageMail = 'Invalid email format';
const errMessageNewMail = 'Invalid new email format';
const errMessagePassword = 'Password must contain at least 1 uppercase letter and 1 number. The minimum password length is 6';

router.post("/sendOtp",
    [
        body('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),

        body('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOtp);

router.post("/verifyOtp",
    [
        body('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),

        body('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOtp);

router.post("/register",
    [
        body('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),

        body('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        body('phone').matches(formatPhone).withMessage(errMessagePhone),

        body('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    MiddlewareController.validateRequestSchema, AuthController.register);

router.post("/login", AuthController.login);
// router.get("/:id/requestRefreshToken", MiddlewareController.VerifyTokenByMySelf, AuthController.requestRefreshToken);
// router.get("/logout", MiddlewareController.verifyToken, AuthController.logout);

router.post("/forgotPassword", AuthController.forgotPassword);

router.post("/verifyOtpPassword", AuthController.verifyOtpPassword);

router.put("/resetPassword",
    [
        body('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.validateRequestSchema, AuthController.resetPassword);

router.post("/sendOTPEmail",
    [
        body('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        body('new_email')
            .isLength({ min: 13 }).withMessage('Minimum length of new email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of new email is 255')
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.validateRequestSchema, AuthController.sendOTPEmail);

router.post("/verifyOTPEmail",
    [
        body('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        body('new_email')
            .isLength({ min: 13 }).withMessage('Minimum length of new email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of new email is 255')
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.validateRequestSchema, AuthController.verifyOTPEmail);

router.put("/updateEmail",
    [
        body('email')
            .isLength({ min: 13 }).withMessage('Minimum length of email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of email is 255')
            .isEmail().withMessage(errMessageMail),

        body('new_email')
            .isLength({ min: 13 }).withMessage('Minimum length of new email is 13')
            .isLength({ max: 255 }).withMessage('Maximum length of new email is 255')
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.verifyTokenByMySelfBody, MiddlewareController.validateRequestSchema, AuthController.updateEmail);

router.put("/requestRefreshToken", MiddlewareController.verifyTokenByMySelf, AuthController.requestRefreshToken);

router.put("/logout", MiddlewareController.verifyTokenByMySelf, AuthController.logout);

module.exports = router;
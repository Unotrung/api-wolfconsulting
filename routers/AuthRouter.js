const AuthController = require('../controllers/AuthController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { body } = require('express-validator');
const router = require('express').Router();
const { VALIDATE_PASSWORD, VALIDATE_PHONE } = require('../config/validate_data/validate_data');
const { ERR_MESSAGE_PHONE, ERR_MESSAGE_MAIL, ERR_MESSAGE_NEW_MAIL, ERR_MESSAGE_PASSWORD, ERR_MSG_MIN_USERNAME, ERR_MSG_MAX_USERNAME, ERR_MSG_MIN_MAIL, ERR_MSG_MAX_MAIL, ERR_MSG_MIN_NEW_MAIL, ERR_MSG_MAX_NEW_MAIL } = require('../config/message/message');

const formatPhone = VALIDATE_PHONE;
const formatPassword = VALIDATE_PASSWORD;

const errMessagePhone = ERR_MESSAGE_PHONE;
const errMessageMail = ERR_MESSAGE_MAIL;
const errMessageNewMail = ERR_MESSAGE_NEW_MAIL;
const errMessagePassword = ERR_MESSAGE_PASSWORD;

router.post('/sendOtp',
    [
        body('username')
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(errMessageMail),
        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOtp);

router.post('/verifyOtp',
    [
        body('username')
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(errMessageMail),
        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOtp);

router.post('/register',
    [
        body('username')
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(errMessageMail),
        body('phone').matches(formatPhone).withMessage(errMessagePhone),
        body('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    MiddlewareController.validateRequestSchema, AuthController.register);

router.post('/login', AuthController.login);

router.post('/forgotPassword', AuthController.forgotPassword);

router.post('/verifyOtpPassword', AuthController.verifyOtpPassword);

router.put('/resetPassword', MiddlewareController.verifyTokenByMySelf,
    [
        body('password').matches(formatPassword).withMessage(errMessagePassword),
    ],
    MiddlewareController.validateRequestSchema, AuthController.resetPassword);

router.post('/sendOTPEmail', MiddlewareController.verifyTokenByMySelf,
    [
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(errMessageMail),
        body('new_email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_NEW_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_NEW_MAIL)
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOTPEmail);

router.post('/verifyOTPEmail', MiddlewareController.verifyTokenByMySelf,
    [
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(errMessageMail),
        body('new_email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_NEW_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_NEW_MAIL)
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOTPEmail);

router.put('/updateEmail', MiddlewareController.verifyTokenByMySelf, MiddlewareController.verifyTokenByMySelfBody,
    [
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(errMessageMail),
        body('new_email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_NEW_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_NEW_MAIL)
            .isEmail().withMessage(errMessageNewMail),
    ],
    MiddlewareController.validateRequestSchema, AuthController.updateEmail);

router.put('/requestRefreshToken', AuthController.requestRefreshToken);

router.get('/getReRefreshToken/:id', MiddlewareController.verifyTokenByMySelf, AuthController.getReRefreshToken);

router.put('/logout', MiddlewareController.verifyTokenByMySelf, AuthController.logout);

router.post('/sendOTPPhone', MiddlewareController.verifyTokenByMySelfBody,
    [
        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOTPPhone);

router.post('/verifyOTPPhone', MiddlewareController.verifyTokenByMySelf,
    [
        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOTPPhone);

router.post('/updateVerifyPhone', MiddlewareController.verifyTokenByMySelf,
    [
        body('phone').matches(formatPhone).withMessage(errMessagePhone),
    ],
    MiddlewareController.validateRequestSchema, AuthController.updateVerifyPhone);

module.exports = router;
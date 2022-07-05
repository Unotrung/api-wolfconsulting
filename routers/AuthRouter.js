const AuthController = require('../controllers/AuthController');
const MiddlewareController = require('../controllers/MiddlewareController');

const { body } = require('express-validator');

const router = require('express').Router();

const { VALIDATE_PASSWORD, VALIDATE_PHONE } = require('../config/validate_data/validate_data');
const {
    ERR_MESSAGE_PHONE, ERR_MESSAGE_MAIL, ERR_MESSAGE_NEW_MAIL, ERR_MESSAGE_PASSWORD, ERR_MSG_MIN_USERNAME,
    ERR_MSG_MAX_USERNAME, ERR_MSG_MIN_MAIL, ERR_MSG_MAX_MAIL, ERR_MSG_MIN_NEW_MAIL, ERR_MSG_MAX_NEW_MAIL
} = require('../config/message/message');

router.post('/sendOtp', MiddlewareController.verifySecurity,
    [
        body('username')
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_MAIL),
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOtp);

router.post('/verifyOtp', MiddlewareController.verifySecurity,
    [
        body('username')
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_MAIL),
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOtp);

router.post('/register', MiddlewareController.verifySecurity,
    [
        body('username')
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_MAIL),
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
        body('password').matches(VALIDATE_PASSWORD).withMessage(ERR_MESSAGE_PASSWORD),
    ],
    MiddlewareController.validateRequestSchema, AuthController.register);

router.post('/login', MiddlewareController.verifySecurity, AuthController.login);

router.post('/forgotPassword', MiddlewareController.verifySecurity, AuthController.forgotPassword);

router.post('/verifyOtpPassword', MiddlewareController.verifySecurity, AuthController.verifyOtpPassword);

router.put('/resetPassword', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('password').matches(VALIDATE_PASSWORD).withMessage(ERR_MESSAGE_PASSWORD),
    ],
    MiddlewareController.validateRequestSchema, AuthController.resetPassword);

router.post('/sendOTPUpdateEmail', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_MAIL),
        body('new_email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_NEW_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_NEW_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_NEW_MAIL),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOTPUpdateEmail);

router.post('/verifyOTPUpdateEmail', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_MAIL),
        body('new_email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_NEW_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_NEW_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_NEW_MAIL),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOTPUpdateEmail);

router.put('/updateEmail', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, MiddlewareController.verifyTokenByMySelfBody,
    [
        body('email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_MAIL),
        body('new_email')
            .isLength({ min: 13 }).withMessage(ERR_MSG_MIN_NEW_MAIL)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_NEW_MAIL)
            .isEmail().withMessage(ERR_MESSAGE_NEW_MAIL),
    ],
    MiddlewareController.validateRequestSchema, AuthController.updateEmail);

router.put('/requestRefreshToken', MiddlewareController.verifySecurity, AuthController.requestRefreshToken);

router.get('/getReRefreshToken/:id', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, AuthController.getReRefreshToken);

router.put('/logout', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, AuthController.logout);

router.post('/sendOTPPhone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelfBody,
    [
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOTPPhone);

router.post('/verifyOTPPhone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOTPPhone);

router.post('/updateVerifyPhone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
    ],
    MiddlewareController.validateRequestSchema, AuthController.updateVerifyPhone);

router.post('/sendOTPUpdatePhone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
        body('new_phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE)
    ],
    MiddlewareController.validateRequestSchema, AuthController.sendOTPUpdatePhone);

router.post('/verifyOTPUpdatePhone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
        body('new_phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE)
    ],
    MiddlewareController.validateRequestSchema, AuthController.verifyOTPUpdatePhone);

router.put('/updatePhone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, MiddlewareController.verifyTokenByMySelfBody,
    [
        body('phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE),
        body('new_phone').matches(VALIDATE_PHONE).withMessage(ERR_MESSAGE_PHONE)
    ],
    MiddlewareController.validateRequestSchema, AuthController.updatePhone);

module.exports = router;
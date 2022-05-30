const UserController = require('../controllers/UserController');
const MiddlewareController = require('../controllers/MiddlewareController');
const { body } = require('express-validator');
const router = require('express').Router();
const { VALIDATE_PASSWORD } = require('../config/validate_data/validate_data');
const { ERR_MESSAGE_PASSWORD, ERR_MESSAGE_NEW_PASSWORD, ERR_MSG_MIN_USERNAME, ERR_MSG_MAX_USERNAME } = require('../config/message/message');

const formatPassword = VALIDATE_PASSWORD;

const errMessagePassword = ERR_MESSAGE_PASSWORD;
const errMessageNewPassword = ERR_MESSAGE_NEW_PASSWORD;

router.get('/', MiddlewareController.verifySecurity, MiddlewareController.verifyToken, UserController.getAllUser);

router.get('/:id', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, UserController.getUser);

router.put('/:id', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf,
    [
        body('username')
            .optional({ nullable: true, checkFalsy: true })
            .isLength({ min: 3 }).withMessage(ERR_MSG_MIN_USERNAME)
            .isLength({ max: 255 }).withMessage(ERR_MSG_MAX_USERNAME),
        body('password')
            .optional({ nullable: true, checkFalsy: true })
            .matches(formatPassword)
            .withMessage(errMessagePassword),
        body('new_password')
            .optional({ nullable: true, checkFalsy: true })
            .matches(formatPassword)
            .withMessage(errMessageNewPassword),
    ],
    MiddlewareController.validateRequestSchema, UserController.updateUser);

module.exports = router;
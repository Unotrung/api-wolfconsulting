const MiddlewareController = require('../controllers/MiddlewareController');
const UserController = require('../controllers/UserController');
const { check, body } = require('express-validator');
const router = require("express").Router();

const formatPassword = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&~^\-+_\(\)]{6,}$/;
const errMessagePassword = 'Password must contain at least 1 uppercase letter and 1 number. The minimum password length is 6';
const errMessageNewPassword = 'New password must contain at least 1 uppercase letter and 1 number. The minimum password length is 6';

router.get("/", MiddlewareController.verifyToken, UserController.getAllUser);

router.get("/:id", MiddlewareController.verifyTokenByMySelf, UserController.getUser);

router.put("/:id",
    [
        body('username')
            .optional({ nullable: true, checkFalsy: true })
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),
        body('password')
            .optional({ nullable: true, checkFalsy: true })
            .matches(formatPassword)
            .withMessage(errMessagePassword),
        body('new_password')
            .optional({ nullable: true, checkFalsy: true })
            .matches(formatPassword)
            .withMessage(errMessageNewPassword),
    ],
    MiddlewareController.verifyTokenByMySelf, MiddlewareController.validateRequestSchema, UserController.updateUser);

module.exports = router;
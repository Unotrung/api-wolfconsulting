const MiddlewareController = require('../controllers/MiddlewareController');
const UserController = require('../controllers/UserController');
const { check } = require('express-validator');
const router = require("express").Router();

const formatPassword = /^(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*#?&~^\\-+_\\(\\)]{6,}$/;
const errMessagePassword = 'Password must contain at least 1 uppercase letter and 1 number. The minimum password length is 6';
const errMessageNewPassword = 'New password must contain at least 1 uppercase letter and 1 number. The minimum password length is 6';

router.get("/", UserController.getAllUser);
router.get("/:id", MiddlewareController.verifyTokenByMySelf, UserController.getUser);
router.put("/:id",
    [
        check('username')
            .isLength({ min: 3 }).withMessage('Minimum length of username is 3')
            .isLength({ max: 255 }).withMessage('Maximum length of username is 255'),
        check('password').matches(formatPassword).withMessage(errMessagePassword),
        check('new_password').matches(formatPassword).withMessage(errMessageNewPassword),
    ],
    MiddlewareController.verifyTokenByMySelf, UserController.updateUser);

module.exports = router;
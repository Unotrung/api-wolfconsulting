const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const MiddlewareController = {

    verifyToken: (req, res, next) => {
        try {
            const token = req.header('authorization');
            if (token) {
                // 'Beaer [token]'
                const accessToken = token.split(" ")[1];
                jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                    if (err) {
                        return res.status(403).json("Token is not valid");
                    }
                    // Trả về user
                    req.user = user;
                    next();
                });
            }
            else {
                return res.status(401).json("You're not authenticated");
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyTokenByMySelf: (req, res, next) => {
        try {
            MiddlewareController.verifyToken(req, res, () => {
                if (req.user.id === req.params.id || req.user.phone === req.body.phone || req.user.email === req.body.email || req.user.phone === req.body.phone_email || req.user.email === req.body.phone_email) {
                    next();
                }
                else {
                    return res.status(403).json('You are not allowed to do this action');
                }
            })
        }
        catch (err) {
            next(err);
        }
    },

    verifyTokenBody: (req, res, next) => {
        try {
            const token = req.body.token;
            if (token) {
                jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
                    if (err) {
                        return res.status(403).json("Token is not valid (Body)");
                    }
                    // Trả về user
                    req.user = user;
                    next();
                });
            }
            else {
                return res.status(401).json("You're not authenticated (Body)");
            }
        }
        catch (err) {
            next(err);
        }
    },

    verifyTokenByMySelfBody: (req, res, next) => {
        try {
            MiddlewareController.verifyTokenBody(req, res, () => {
                if (req.user.phone === req.body.phone || req.user.email === req.body.email || req.user.phone === req.body.phone_email || req.user.email === req.body.phone_email) {
                    next();
                }
                else {
                    return res.status(403).json('You are not allowed to do this action (Body)');
                }
            })
        }
        catch (err) {
            next(err);
        }
    },

    validateRequestSchema: (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                })
            }
            else {
                next();
            }
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = MiddlewareController;
const jwt = require('jsonwebtoken');

const middlewareController = {

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
                return res.status(200).json("You're not authenticated");
            }
        }
        catch (err) {
            next(err);
        }
    },

    VerifyTokenByMySelf: (req, res, next) => {
        try {
            middlewareController.verifyToken(req, res, () => {
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
                return res.status(200).json("You're not authenticated");
            }
        }
        catch (err) {
            next(err);
        }
    },

    VerifyTokenByMySelfBody: (req, res, next) => {
        try {
            middlewareController.verifyTokenBody(req, res, () => {
                if (req.user.phone === req.body.phone || req.user.email === req.body.email) {
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

}

module.exports = middlewareController;
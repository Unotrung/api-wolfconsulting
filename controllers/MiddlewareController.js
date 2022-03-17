const jwt = require('jsonwebtoken');

const middlewareController = {

    verifyToken: (req, res, next) => {
        try {
            // Lấy token từ người dùng thông qua authorization
            const token = req.header('authorization');
            if (token) {
                // 'Beaer [token]'
                const accessToken = token.split(" ")[1];
                jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                    console.log(err, user);
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

    VerifyTokenByMySelfAndAdmin: (req, res, next) => {
        try {
            middlewareController.verifyToken(req, res, () => {
                if (req.user.id === req.params.id || req.user.admin) {
                    next();
                }
                else {
                    return res.status(200).json('You are not allowed to delete other');
                }
            })
        }
        catch (err) {
            next(err);
        }
    }

}

module.exports = middlewareController;
const jwt = require('jsonwebtoken');

const middlewareController = {
    // VerifyToken: Xác nhận có phải bạn đang truy cập hay không hay là người nào khác dùng tài khoản của bạn đăng nhập
    verifyToken: (req, res, next) => {
        // Lấy token từ người dùng thông qua headers
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(" ")[1];
            // Chứng nhận token 
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    // Nếu có lỗi nghĩa là bạn không phải người dùng nó hoặc token đã hết hạn
                    return res.status(403).json("Token is not valid");
                }
                // Trả về user
                req.user = user;
                // next có nghĩa là nếu toàn bộ các điều kiện trên thỏa thì đi tiếp
                // middleware như thằng ở giữa chặn lại khi nào các bạn thỏa hết điều kiện mới cho đi tiếp
                next();
            });
        }
        else {
            return res.status(200).json("You're not authenticated");
        }
    },

    // VerifyTokenByMySelfAndAdmin: Xác nhận có phải bạn hoặc admin đang truy cập hay không hay là người nào khác dùng tài khoản của bạn đăng nhập
    VerifyTokenByMySelfAndAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            // Nếu mà id của mình trùng với id muốn xóa hoặc mình là admin thì thực hiện tiếp
            if (req.user.id === req.params.id || req.user.admin) {
                next();
            }
            else {
                return res.status(200).json('You are not allowed to delete other');
            }
        })
    }
}

module.exports = middlewareController;
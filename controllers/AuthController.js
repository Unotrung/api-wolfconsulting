const Auth = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = [];

const AuthController = {
    register: async (req, res) => {
        try {
            // Get data from User
            let username = req.body.username;
            let email = req.body.email;
            let phone = req.body.phone;
            let password = req.body.password;
            // Encryption password with bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            // Create New User 
            const newUser = await new Auth({
                username: username,
                email: email,
                phone: phone,
                password: hashed
            });
            // Save To DB
            const user = await newUser.save();
            return res.status(200).json(user);
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },

    generateAccessToken: (auth) => {
        return jwt.sign(
            {
                id: auth.id,
                admin: auth.admin,
            },
            // Thêm 1 mã secret key để nó an toàn hơn
            process.env.JWT_ACCESS_KEY,
            // Mã access token này sẽ tồn tại trong khoảng thời gian bao lâu 
            // Sau 2h mã access token này sẽ biến mất và người dùng phải đăng nhập lại
            { expiresIn: "30s" }
        );
    },

    generateRefreshToken: (auth) => {
        return jwt.sign(
            {
                id: auth.id,
                admin: auth.admin,
            },
            // Thêm 1 mã secret key để nó an toàn hơn
            process.env.JWT_REFRESH_KEY,
            // Sau 2h mã access token này sẽ biến mất và người dùng phải đăng nhập lại
            { expiresIn: "2h" }
        );
    },

    login: async (req, res) => {
        try {
            // Vì email là unique => Chỉ cần tìm 1 
            const auth = await Auth.findOne({ email: req.body.email });
            if (!auth) {
                return res.status(401).json("Wrong Email!");
            }
            // So sánh mk của người dùng và mk trong db (so sánh 2 cái mk được mã hóa)
            const validPassword = await bcrypt.compare(req.body.password, auth.password);
            if (!validPassword) {
                return res.status(401).json("Wrong Password!");
            }
            if (auth && validPassword) {
                // Nếu auth và validPassword hợp lệ thì gắn token kèm theo
                const accessToken = AuthController.generateAccessToken(auth);
                // Khi accessToken của người dùng hết hạn thì nó sẽ tự động Refresh lại
                const refreshToken = AuthController.generateRefreshToken(auth);
                // Lưu trữ refreshToken
                refreshTokens.push(refreshToken);
                // Lưu refresh token vào cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false, // Khi deploy lên server nên đổi lại là true
                    path: '/', // Có cũng được không có cũng không sao
                    sameSite: 'strict', // Ngăn chặn cách tấn công. Những cái http Request chỉ được đến từ site này thôi
                });
                const { password, ...others } = auth._doc;
                // Khi trả thông tin người dùng về thì ta không nên trả về password kèm theo chỉ cần trả về những thông tin khác ngoại trừ password
                // đồng thời gắn kèm theo token và refreshToken
                // Bởi vì ta đã lưu cái refreshToken này trong cookie òi nên mình không cần trả về front end. Mặc định khi đăng nhập ta sẽ luôn có 1 cookie
                // chứa refreshToken
                // return res.status(200).json({ ...others, accessToken, refreshToken });
                return res.status(200).json({ ...others, accessToken });
            }
        }
        catch (err) {
            return res.status(500).json(err);
        }
    },

    requestRefreshToken: async (req, res) => {
        // accessToken là ngắn hạn, refreshToken là dài hạn
        // Khi mà accessToken hết hạn thì mình không dùng nó được nữa, còn refreshToken là lâu dài nên mình sẽ sử dụng chủ yếu thằng này
        // Take Refresh Token From User 
        // Nãy ở trên lưu cookies ta đặt tên là gì thì gọi về như vậy
        const refreshToken = req.cookies.refreshToken;
        // refreshToken không tồn tại
        if (!refreshToken) {
            return res.status(401).json('You are not authenticated');
        }
        // refreshToken không hợp lệ
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json('Refresh Token is not valid');
        }
        // Xác minh refreshToken này có hợp lệ không?
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                console.log(err);
            }
            // Lọc refreshToken cũ đi trước khi thêm refreshToken mới vào
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            // Nếu refreshToken này hợp lệ nó sẽ trả lại người dùng đồng thời khởi tạo 1 accessToken mới với refreshToken mới luôn
            const newAccessToken = AuthController.generateAccessToken(user);
            const newRefreshToken = AuthController.generateRefreshToken(user);
            refreshTokens.push(newRefreshToken);
            // Sau đó lưu cái refreshToken này lên cookie lại
            // Lưu refresh token vào cookie. Trả về 1 access token mới và cookie mới
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false, // Khi deploy lên server nên đổi lại là true
                path: '/', // Có cũng được không có cũng không sao
                sameSite: 'strict', // Ngăn chặn cách tấn công. Những cái http Request chỉ được đến từ site này thôi
            });
            return res.status(200).json({ accessToken: newAccessToken });
        }
        )
    },

    logout: async (req, res) => {
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
        return res.status(200).json('Logged out success !');
    }
}

module.exports = AuthController;
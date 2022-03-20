const AuthController = require("../controllers/AuthController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.post("/sendOtp", AuthController.sendOtp);
router.post("/verifyOtp", AuthController.verifyOtp);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/requestRefreshToken", MiddlewareController.VerifyTokenByMySelf, AuthController.requestRefreshToken);
router.get("/logout", MiddlewareController.verifyToken, AuthController.logout);
router.post("/forgotPassword", AuthController.forgotPassword);
router.post("/verifyOtpPassword", AuthController.verifyOtpPassword);
router.put("/updatePassword", MiddlewareController.VerifyTokenByMySelf, AuthController.updatePassword);

module.exports = router;
const AuthController = require("../controllers/AuthController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.post("/sendOtp", AuthController.sendOtp);
router.post("/verifyOtp", AuthController.verifyOtp);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/:id/requestRefreshToken", MiddlewareController.VerifyTokenByMySelf, AuthController.requestRefreshToken);
// router.get("/logout", MiddlewareController.verifyToken, AuthController.logout);
router.post("/forgotPassword", AuthController.forgotPassword);
router.post("/verifyOtpPassword", AuthController.verifyOtpPassword);
router.put("/resetPassword", MiddlewareController.VerifyTokenByMySelf, AuthController.resetPassword);
router.post("/sendOTPEmail", MiddlewareController.VerifyTokenByMySelf, AuthController.sendOTPEmail);
router.post("/verifyOTPEmail", MiddlewareController.VerifyTokenByMySelf, AuthController.verifyOTPEmail);
router.put("/updateEmail", MiddlewareController.VerifyTokenByMySelf, MiddlewareController.VerifyTokenByMySelfBody, AuthController.updateEmail);

module.exports = router;
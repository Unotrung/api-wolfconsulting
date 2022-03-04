const AuthController = require("../controllers/AuthController");
const middlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/requestRefreshToken", AuthController.requestRefreshToken);
router.get("/logout", middlewareController.verifyToken, AuthController.logout);

module.exports = router;
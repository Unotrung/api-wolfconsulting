const MiddlewareController = require('../controllers/MiddlewareController');
const UserController = require('../controllers/UserController');

const router = require("express").Router();

router.get("/", UserController.getAllUser);
router.put("/:id", MiddlewareController.VerifyTokenByMySelf, UserController.updateUser);
router.get("/:phone", MiddlewareController.VerifyTokenByMySelf, UserController.getUser);

module.exports = router;
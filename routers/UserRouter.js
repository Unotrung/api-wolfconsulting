const MiddlewareController = require('../controllers/MiddlewareController');
const UserController = require('../controllers/UserController');

const router = require("express").Router();

router.get("/", UserController.getAllUser);
router.get("/:id", MiddlewareController.VerifyTokenByMySelf, UserController.getUser);
router.put("/:id", UserController.updateUser);

module.exports = router;
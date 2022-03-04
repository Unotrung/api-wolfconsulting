const middlewareController = require('../controllers/MiddlewareController');
const UserController = require('../controllers/UserController');

const router = require("express").Router();

router.get("/", middlewareController.verifyToken, UserController.getAllUser);
router.get("/:id", UserController.getUser);
router.delete("/deleteUser/:id", middlewareController.VerifyTokenByMySelfAndAdmin, UserController.deleteUser);

module.exports = router;
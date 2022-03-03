const UserController = require('../controllers/UserController');

const router = require("express").Router();

router.get("/", UserController.getAllUser);
router.get("/:id", UserController.getUser);
router.delete("/deleteUser/:id", UserController.deleteUser);

module.exports = router;
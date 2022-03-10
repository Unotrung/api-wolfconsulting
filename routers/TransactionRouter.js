const TransactionController = require("../controllers/TransactionController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.get("/", MiddlewareController.verifyToken, TransactionController.getTransactions);

module.exports = router;
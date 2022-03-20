const TransactionController = require("../controllers/TransactionController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.get("/:id", MiddlewareController.VerifyTokenByMySelf, TransactionController.getTransactions);
router.get("/transactionDetail/:id", MiddlewareController.verifyToken, TransactionController.getTransactionDetail);

module.exports = router;
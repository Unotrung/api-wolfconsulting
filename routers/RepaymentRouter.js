const RepaymentController = require("../controllers/RepaymentController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.get("/", MiddlewareController.verifyToken, RepaymentController.getRepayments);

module.exports = router;
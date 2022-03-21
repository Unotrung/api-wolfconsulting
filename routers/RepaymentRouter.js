const RepaymentController = require("../controllers/RepaymentController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.get("/:id", MiddlewareController.VerifyTokenByMySelf, RepaymentController.getRepayments);
router.get("/repaymentDetail/:id", MiddlewareController.verifyToken, RepaymentController.getRepaymentDetail);

module.exports = router;
const RepaymentController = require("../controllers/RepaymentController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.get("/:id", MiddlewareController.verifyTokenByMySelf, RepaymentController.getRepayments);
router.get("/repaymentDetail/:id/:idRepayment", MiddlewareController.verifyTokenByMySelf, RepaymentController.getRepaymentDetail);

module.exports = router;
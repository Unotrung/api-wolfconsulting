const RepaymentController = require("../controllers/RepaymentController");
const MiddlewareController = require("../controllers/MiddlewareController");

const router = require("express").Router();

router.get("/:id", MiddlewareController.VerifyTokenByMySelf, RepaymentController.getRepayments);
router.get("/repaymentDetail/:id/:idRepayment", MiddlewareController.VerifyTokenByMySelf, RepaymentController.getRepaymentDetail);

module.exports = router;
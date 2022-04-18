const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/generateContract", CommonController.generateContract);
router.get("/generateProviders", CommonController.generateProviders);
router.post("/generateRepayment", CommonController.generateRepayment);
router.post("/generateTransaction", CommonController.generateTransaction);

module.exports = router;
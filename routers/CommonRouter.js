const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/generateContract", CommonController.generateContract);
router.get("/generateProviders", CommonController.generateProviders);
router.get("/generateRepayment", CommonController.generateRepayment);
router.get("/generateTransaction", CommonController.generateTransaction);

module.exports = router;
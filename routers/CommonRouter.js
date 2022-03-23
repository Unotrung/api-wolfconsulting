const CommonController = require('../controllers/CommonController');

const router = require("express").Router();

router.get("/generateContract", MiddlewareController.VerifyTokenByMySelf, CommonController.generateContract);
router.put("/generateProviders", MiddlewareController.VerifyTokenByMySelf, CommonController.generateProviders);

module.exports = router;
const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require("express").Router();

router.get("/:id/generateContract", MiddlewareController.VerifyTokenByMySelf, CommonController.generateContract);
router.get("/:id/generateProviders", MiddlewareController.VerifyTokenByMySelf, CommonController.generateProviders);

module.exports = router;
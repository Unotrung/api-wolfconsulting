const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require("express").Router();

router.get("/generateContract", MiddlewareController.verifyToken, CommonController.generateContract);
router.put("/generateProviders", MiddlewareController.verifyToken, CommonController.generateProviders);

module.exports = router;
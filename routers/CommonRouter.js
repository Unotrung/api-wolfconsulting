const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require("express").Router();

router.get("/generateContract", CommonController.generateContract);
router.get("/generateProviders", CommonController.generateProviders);

module.exports = router;
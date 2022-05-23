const CommonController = require('../controllers/CommonController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require('express').Router();

router.get('/generateContract', MiddlewareController.verifySecurity, CommonController.generateContract);
router.get('/generateProviders', MiddlewareController.verifySecurity, CommonController.generateProviders);
router.post('/generateRepayment', MiddlewareController.verifySecurity, CommonController.generateRepayment);
router.post('/generateTransaction', MiddlewareController.verifySecurity, CommonController.generateTransaction);

module.exports = router;
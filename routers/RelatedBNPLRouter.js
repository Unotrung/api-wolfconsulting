const RelatedBNPLController = require('../controllers/RelatedBNPLController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require('express').Router();

router.get('/:phone', MiddlewareController.verifySecurity, MiddlewareController.verifyTokenByMySelf, RelatedBNPLController.getUser);

module.exports = router;
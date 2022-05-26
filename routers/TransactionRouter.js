const TransactionController = require('../controllers/TransactionController');
const MiddlewareController = require('../controllers/MiddlewareController');

const router = require('express').Router();

router.get('/:id', MiddlewareController.verifyTokenByMySelf, TransactionController.getTransactions);
router.get('/transactionDetail/:id/:idTransaction', MiddlewareController.verifyTokenByMySelf, TransactionController.getTransactionDetail);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
   ROUTE_CREATE_OR_LIST_TRANSACTIONS,
   ROUTE_GET_A_TRANSACTION,
} = require('../lib/resource-routes');
const TransactionsController = require('../controllers/transactions');
const { RESOURCE_NOT_FOUND } = require('../lib/error-messages');
const AppAuth = require('../middleware/app-auth');

const transactionsController =  new TransactionsController();

router.post(ROUTE_CREATE_OR_LIST_TRANSACTIONS, AppAuth, async (req, res) => {
   return await transactionsController.addTransactionAction(req, res);
});
router.get(ROUTE_CREATE_OR_LIST_TRANSACTIONS, AppAuth, async(req, res) => {
   return await transactionsController.listTransactionsAction(req, res);
});
router.get(ROUTE_GET_A_TRANSACTION, AppAuth, async(req, res) => {
   return await transactionsController.getTransactionAction(req, res);
});

//Request that doesn't match any of the above routes results in a resource not found error; Return this error to the api caller.
router.use((req, res) => {
   return TransactionsController.sendFailedResponse(res, {...RESOURCE_NOT_FOUND}, 404);
});

module.exports = router;

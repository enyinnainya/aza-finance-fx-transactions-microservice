const BaseController = require('./base');
const TransactionService = require('../services/transactions');
const {APPLICATION_ERROR} = require('../lib/error-messages');
const {empty, isBoolean, isArray} = require('../lib/utils');

class TransactionsController extends BaseController {

   constructor() {
      super();
      this.transactionService = new TransactionService();
   }

   /**
    * @api {POST} /transactions/ add an fx transaction
    * @apiDescription Endpoint to add an fx transaction based on post data/payload
    * @apiName AddTransaction
    * @apiGroup Transactions
    *
    * @apiParam {String} jwt token returned from access token endpoint during login pass via header authorization
    * @apiParam {String} customerId ID of the customer whom this transaction is created for
    * @apiParam {String} fromAmount This is the amount received from the customer in the origin currency; Also known as the Input Amount
    * @apiParam {String} fromCurrency This is the currency the money was received from the customer. Also known as the input or origin currency
    * @apiParam {String} toAmount This is the amount to be paid to the customer in the destination currency after FX conversion and processing. Also known as the Output Amount
    * @apiParam {String} toCurrency This is the currency the money will be paid out ; Also known as the output or destination currency
    *
    * @apiSuccess success true
    * @apiSuccess {Object} data => {'id' => [The new transaction id, used to manage this transaction]}
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 201 Created
    *     {
    *       data: {
    *         "id": "604536badb4d543bcb7076b3",
    *          "customerId": "615b6742d6676e356218923b",
    *          "fromAmount" "1000",
    *          "fromCurrency": "USD",
    *          "toAmount": "500000",
    *          "toCurrency": "NGN"
    *       },
    *       "success": true
    *     }
    *
    * @apiError success false
    * @apiError errors object of fields and error messages
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 400 Bad Request
    *     {
    *       "success": false,
    *       "errors": {"customerId": "The Customer ID field is required"}
    *     }
    */
   async addTransactionAction(req, res) {
      try {
         const post_data = (!empty(req) && !empty(req.body)) ? req.body : {};
         const {data, success} = await this.transactionService.addTransaction(post_data);
         if (isBoolean(success) && success === true) {
            return TransactionsController.sendSuccessResponse(res, (!empty(data) ? data : post_data), 201);
         }

         return TransactionsController.sendFailedResponse(res, (!empty(data) ? data : APPLICATION_ERROR), (data && data.app) ? 500 : 400);
      } catch (err) {
         return TransactionsController.sendFailedResponse(res, APPLICATION_ERROR,500);
      }
   }

   /**
    * @api {GET} /transactions list all fx transactions
    * @apiDescription Endpoint to list all the fx transactions in the system
    * @apiName ListTransactions
    * @apiGroup Transactions
    *
    * @apiParam {String} jwt token returned from access token endpoint during login pass via header authorization
    *
    * @apiSuccess success true
    * @apiSuccess {Object} data => [{'id' => [The transaction id for record 1]}, {'id' => [The transaction id for record 2]} ]
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       data: [
    *       {
    *         "id": "604536badb4d543bcb7076b3",
    *          "customerId": "615b6742d6676e356218923b",
    *          "fromAmount" "1000",
    *          "fromCurrency": "USD",
    *          "toAmount": "500000",
    *          "toCurrency": "NGN"
    *       },
    *         {
    *         "id": "61225a76465d5566bb71a562",
    *          "customerId": "435b6742d6676e356218923b",
    *          "fromAmount" "45",
    *          "fromCurrency": "USD",
    *          "toAmount": "17000",
    *          "toCurrency": "NGN"
    *       }]
    *       "success": true
    *     }
    *
    * @apiError success false
    * @apiError errors object of fields and error messages
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 404 Not Found
    *     {
    *       "success": false,
    *       "errors": {"transactions": "No fx transactions found at the moment, please check back later!"}
    *     }
    */
   async listTransactionsAction(req, res) {
      try {

         const search_constraints = (!empty(req) && !empty(req.body)) ? req.body : {};
         const {data, success} = await this.transactionService.listTransactions(search_constraints);
         if (isBoolean(success) && success === true) {
            const additionalMetaData = {totalRecords: (!empty(data) && isArray(data)) ? data.length : 0}
            return TransactionsController.sendSuccessResponse(res, (!empty(data) ? data : []), 200, additionalMetaData);
         }
         return TransactionsController.sendFailedResponse(res, (!empty(data) ? data : APPLICATION_ERROR),(data && data.app) ? 500 : 404);
      } catch (err) {
         return TransactionsController.sendFailedResponse(res, APPLICATION_ERROR,500);
      }
   }

   /**
    * @api {GET} /transactions/:id gets a specific fx transaction by ID
    * @apiDescription Endpoint to get a single fx transactions based on provided ID
    * @apiName GetTransaction
    * @apiGroup Transactions
    *
    * @apiParam {String} jwt token returned from access token endpoint during login pass via header authorization
    *
    * @apiSuccess success true
    * @apiSuccess {Object} data => {'id' => [The transaction id for record 1]}
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       data: {
    *         "id": "604536badb4d543bcb7076b3",
    *          "customerId": "615b6742d6676e356218923b",
    *          "fromAmount" "1000",
    *          "fromCurrency": "USD",
    *          "toAmount": "500000",
    *          "toCurrency": "NGN"
    *       }
    *       "success": true
    *     }
    *
    * @apiError success false
    * @apiError errors object of fields and error messages
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 400 Bad Request
    *     {
    *       "success": false,
    *       "errors": {"transaction": "Please provide a valid transaction ID to get an fx transaction. Transaction ID must be a valid Hexdecimal string and 24 characters long. e.g. 507f191e810c19729de860ea"}
    *     }
    */
   async getTransactionAction(req, res) {
      try {

         const transactionId = (!empty(req) && !empty(req.params) && !empty(req.params.id))? req.params.id : null;
         const { data, success } = await this.transactionService.getTransaction(transactionId);
         if (isBoolean(success) && success === true) {
            return TransactionsController.sendSuccessResponse(res, (!empty(data)?data:null), 200);
         }
         return TransactionsController.sendFailedResponse(res, (!empty(data)?data:APPLICATION_ERROR), (data && data.app) ? 500 : 400);
      } catch (err) {
         return TransactionsController.sendFailedResponse(res, APPLICATION_ERROR, 500);
      }
   }

    /**
    * @api {POST} /transactions/update update an fx transaction
    * @apiDescription Endpoint to update an existing fx transaction based on post data/payload
    * @apiName UpdateTransaction
    * @apiGroup Transactions
    *
    * @apiParam {String} jwt token returned from access token endpoint during login pass via header authorization
    * @apiParam {String} required ID of the transaction to be udpated
    * @apiParam {String} optional customerId ID of the customer whom this transaction linked to
    * @apiParam {String} optional fromAmount This is the amount received from the customer in the origin currency; Also known as the Input Amount
    * @apiParam {String} optional fromCurrency This is the currency the money was received from the customer. Also known as the input or origin currency
    * @apiParam {String} optional toAmount This is the amount to be paid to the customer in the destination currency after FX conversion and processing. Also known as the Output Amount
    * @apiParam {String} optional toCurrency This is the currency the money will be paid out ; Also known as the output or destination currency
    *
    * @apiSuccess success true
    * @apiSuccess {Object} data => {'id' => [The updated transaction id, used to manage this transaction]}
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *       data: {
    *         "id": "604536badb4d543bcb7076b3",
    *          "customerId": "615b6742d6676e356218923b",
    *          "fromAmount" "500",
    *          "fromCurrency": "USD",
    *          "toAmount": "80000",
    *          "toCurrency": "NGN"
    *       },
    *       "success": true
    *     }
    *
    * @apiError success false
    * @apiError errors object of fields and error messages
    *
    * @apiErrorExample Error-Response:
    *     HTTP/1.1 400 Bad Request
    *     {
    *       "success": false,
    *       "errors": {"toCurrency": "The Output Currency must be a string and must be 3 characters long"}
    *     }
    */
   async updateTransactionAction(req,res){
      try{

         const postData = (req && !empty(req.body))?req.body:{};
         const {data, success} = await this.transactionService.updateTransaction(postData);
         if(isBoolean(success) && success === true){
            return TransactionsController.sendSuccessResponse(res,(!empty(data)?data:null), 200);
         }
         return TransactionsController.sendFailedResponse(res, (!empty(data)?data:APPLICATION_ERROR), (data && data.app)?500: 400);
      }catch(err){
         return TransactionsController.sendFailedResponse(res, APPLICATION_ERROR, 500);
       
      }
   }
}

module.exports = TransactionsController;

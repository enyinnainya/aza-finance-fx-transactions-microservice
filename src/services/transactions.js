const BaseService = require('./base');
const TransactionModel = require('../models/transaction');
const Joi = require('joi');
const {TRANSACTION_NOT_CREATED, APPLICATION_ERROR, TRANSACTIONS_NOT_FOUND, TRANSACTION_NOT_FOUND} = require('../lib/error-messages');
const { empty, isObject, number_format, isArray, isString } = require('../lib/utils');
const BaseModel = require('../models/base');

class TransactionsService extends BaseService {
    constructor() {
        super()
    }

    /**
     * Service to create transactions based on request post payload
     * @param {*} post_data
     * @returns {object}
     */
    async addTransaction(post_data = null) {
        try {
            post_data = TransactionsService.sanitizeRequestData(post_data);

            //Defining validation schema for post payload
            const schema = Joi.object({
                customerId: Joi.string()
                    .alphanum()
                    .required()
                    .label("Customer ID"),

                fromAmount: Joi.number()
                    .precision(2)
                    .required()
                    .strict(true)
                    .label("Input or Source Amount"),

                toAmount: Joi.number()
                    .precision(2)
                    .required()
                    .strict(true)
                    .label("Output or Destination Amount"),

                fromCurrency: Joi.string()
                    .length(3)
                    .pattern(/^[A-Z]+$/)
                    .required()
                    .label("Input or Source Currency"),

                toCurrency: Joi.string()
                    .length(3)
                    .pattern(/^[A-Z]+$/)
                    .required()
                    .label("Output or Destination Currency")
            })

            const errors = await TransactionsService.validateJoiPost(schema, post_data);

            // check for errors and create transaction if no errors
            if (empty(errors)) {
                let new_transaction_data = {
                    customerId: !empty(post_data.customerId) ? post_data.customerId.trim() : null,
                    fromAmount: !empty(post_data.fromAmount) ? parseFloat(number_format(parseFloat(post_data.fromAmount.toString().trim()), 2, ".", "")) : 0,
                    fromCurrency: !empty(post_data.fromCurrency) ? post_data.fromCurrency.trim() : '',
                    toAmount: !empty(post_data.toAmount) ? parseFloat(number_format(parseFloat(post_data.toAmount.toString().trim()), 2, ".", "")) : 0,
                    toCurrency: !empty(post_data.toCurrency) ? post_data.toCurrency.trim() : ''
                };

                //creating transaction and return new transaction data if no errors
                let addResult = null;
                if(!empty(new_transaction_data)) {
                    const transactionModel =  new TransactionModel();
                    try{
                        addResult = await transactionModel.add(new_transaction_data);
                    }catch(err){
                        throw new Error (APPLICATION_ERROR.app)
                    }
                }
                if (!empty(addResult)) {
                    return TransactionsService.sendSuccessResponse(addResult);
                } else {
                    return TransactionsService.sendFailedResponse(TRANSACTION_NOT_CREATED );
                }
            }
            return TransactionsService.sendFailedResponse(errors);
        } catch (err) {
            return TransactionsService.sendFailedResponse(APPLICATION_ERROR);
        }
    }

    /**
     * Service to list all fx transactions
     * @param {*} search_constraints
     * @returns {object}
     */
    async listTransactions(search_constraints = {}) {
        try {
            search_constraints = (search_constraints && isObject(search_constraints)) ? search_constraints : {};

            //getting list of fx transactions and return retrieved records if no errors
            let transactionsData = null;
            const transactionModel = new TransactionModel();
            try {
                transactionsData = await transactionModel.getRecords(search_constraints);
                if(!empty(transactionsData) && isArray(transactionsData)){
                    transactionsData = transactionsData.map(transaction=>{
                        if(transaction._id) {
                            transaction.id = BaseModel.getMongoStringId(transaction._id);
                            try {
                                delete transaction._id;
                            } catch (err) {
                                transaction._id = null;
                            }
                        }
                        return transaction;
                    })
                }
            } catch (err) {
                throw new Error (APPLICATION_ERROR.app)
            }
            if (!empty(transactionsData)) {
                return TransactionsService.sendSuccessResponse(transactionsData);
            }
            return TransactionsService.sendFailedResponse(TRANSACTIONS_NOT_FOUND);
        } catch (err) {
            return TransactionsService.sendFailedResponse(APPLICATION_ERROR);
        }
    }

    /**
     * Service to list all fx transactions
     * @param {*} transactionId
     * @returns {object}
     */
    async getTransaction(transactionId = null) {
        try {
            let errors={};
            transactionId = (transactionId && (isObject(transactionId) || isString(transactionId))) ? transactionId: null;

            if(!transactionId){
                errors={transaction: "Please provide a transaction ID to get an fx transaction. Transaction ID must be a valid Hexdecimal string and 24 characters long. e.g. 507f191e810c19729de860ea"}
            }else if(!BaseModel.isMongoId(transactionId)){
                errors={transaction: "Please provide a valid transaction ID to get an fx transaction. Transaction ID must be a valid Hexdecimal string and 24 characters long. e.g. 507f191e810c19729de860ea"}
            }

            //Get requested transaction and return data if no errors
            if(empty(errors)) {
                let transactionData = null;
                const transactionModel = new TransactionModel();
                try {
                    transactionData = await transactionModel.getById(transactionId);
                    if (!empty(transactionData) && isObject(transactionData) && transactionData._id) {
                        transactionData.id = BaseModel.getMongoStringId(transactionData._id);
                        try {
                            delete transactionData._id;
                        } catch (err) {
                            transactionData._id = null;
                        }
                    }
                } catch (err) {
                    throw new Error(APPLICATION_ERROR.app)
                }
                if (!empty(transactionData)) {
                    return TransactionsService.sendSuccessResponse(transactionData);
                }
                return TransactionsService.sendFailedResponse(TRANSACTION_NOT_FOUND);
            }
            return TransactionsService.sendFailedResponse(errors);
        } catch (err) {
            return TransactionsService.sendFailedResponse(APPLICATION_ERROR);
        }
    }

}

module.exports = TransactionsService;

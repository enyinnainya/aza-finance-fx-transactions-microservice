const { COLLECTION_NAME_TRANSACTION } = require('../lib/constants');
const BaseModel = require('./base');

class TransactionModel extends BaseModel {
    constructor (collection_name=null, db = null) {

        // set collection name
        super(collection_name || COLLECTION_NAME_TRANSACTION, db)
    }
}

module.exports = TransactionModel;
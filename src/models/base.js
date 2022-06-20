
const dbo = require('../lib/db');
const { utf8_convert, empty, isObject, isString, isNumber, getTimestamp, getFormattedDate } = require('../lib/utils');
const { FX_TRANSACTION_DATABASE } = require('../lib/constants');
const { APPLICATION_ERROR } = require('../lib/error-messages');

/**
 *  set up base functionality with helper class methods and props used for CRUD operations and db data processing for inherited subclasses
 * Class BaseModel
 */
class BaseModel {

    /**
     *  prop to store boolean whether or not db has been established to prevent multiple reconnections
     */
    static is_db_connection_established = false;

    /**
     * collection and db names
     * @var
     */
    collection_name = null;
    db_name = FX_TRANSACTION_DATABASE;

    /**
     * constructor to create db instance and try to establish db connection if not done already
     * @param collection_name
     * @param db
     */
    constructor(collection_name, db = null) {
        if (!empty(db) && isString(db)) {
            this.db_name = db;
        }
        if (!empty(collection_name) && isString(collection_name)) {
            this.collection_name = collection_name;
        }
        return this;
    };


    /**
     * establishing db connection if not done already
     * connect to database or collection, throw exception if connection fails
     * @param {object|string} db    specify the database connection
     * @return {true | *}         throw exception if it fails or true
     * @throws Exception
     */
   static async connectDB(db =  null) {

       if(!BaseModel.is_db_connection_established) {
           const dbConnected = await dbo.connect(db);
           if (dbConnected) {
               BaseModel.is_db_connection_established = true;
           } else {
               throw new Error("Unable to establish db connection");
           }
       }
    }

    /**
     * close DB connection
     * @returns {Promise<*|undefined>}
     */
    static async closeDBConnection(){
        return await dbo.close();
    }

    /**
     * return one row from collection based on supplied field name and value
     * @param {string} field name of field to get data from e.g. email, first_name etc
     * @param {*} value        matching field value to search for e.g. xyz@abc.com
     * @return {object}   false or result row
     */
    async getRowByField(field, value) {
        try {
            if (field === "_id" && isString(value) && BaseModel.isMongoId(value)) {
                value = BaseModel.getMongoId(value);
            }
            const results = await dbo.dbConnection().collection(this.collection_name).findOne({
                [field]: value
            });

            return !empty(results) ? results : null;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * find one row in collection by _id (string or MongoId) with supplied value
     * @param {string|ObjectId} id 24 character _id or MongoId to find
     * @return {bool|array}           false or result row
     */
    async getById(id) {
        if (isObject(id) && !empty(id['oid'])) {
            id = id['oid'];
        }

        // return record if available or null
        return await this.getRowByField('_id', id);
    }

    /**
     * get list of records
     * @param {object} constraints
     * @param {object} options
     * @return {array}
     */
    async getRecords(constraints = {}, options = {}) {
        let fields = [], query_options = {}, sort = {}, limit = 100, skip = 0, results;

        if (!empty(options.fields)) {
            fields = Array.from(options.fields);
        }
        if (!empty(fields)) {
            query_options.projection = {};
            for(let field of fields){
                query_options.projection[field] = 1;
            }
        }
        if (!empty(options.sort)) {
            sort = options.sort;
            query_options.sort = sort;
        }
        if (!empty(options.limit)) {
            limit = parseInt(options.limit.toString());
            if(isNumber(limit)){
                query_options.limit = limit;
            }
        }
        if (!empty(options.skip)) {
            skip = parseInt(options.skip.toString());
            if(isNumber(skip)){
                query_options.skip = skip;
            }
        }

        return new Promise(async (resolve, reject) => {
            try {
                results = await dbo.dbConnection().collection(this.collection_name).find(constraints, query_options);
                resolve(results ? results.toArray() : [])
            } catch (err) {
                reject(APPLICATION_ERROR.app)
            }
        })
    }


    /**
     * get a record
     * @param {object} constraints
     * @return {object}        Null or object with data
     */
    async getRecord(constraints = {}) {
        let id = null;
        if ((isString(constraints) && constraints.length === 24) || BaseModel.isMongoId(constraints)) {
            id = constraints;
        }
        if (id) {
            return this.getById(id);
        }

        return await dbo.dbConnection().collection(this.collection_name).findOne(constraints);
    }

    /**
     * add a record
     * @param {*} document
     * @return mixed
     */
    async add(document) {
        let responseData=null;
        if (!isObject(document)) {
            return responseData;
        }
        document = utf8_convert(document);
        if (empty(document['_id']) || !BaseModel.isMongoId(document['_id'])) {
            document['_id'] = BaseModel.getMongoId();
        }

        if (empty(document['created']) || !isString(document['created'])) {
            document['created'] = getFormattedDate();
            document['createdTimestamp'] = getTimestamp();
        } else{
            document['createdTimestamp'] = getTimestamp(document['created']);
        }

        if (empty(document['updated']) || !isString(document['updated'])) {
            document['updated'] = getFormattedDate();
            document['updatedTimestamp'] = getTimestamp();
        } else{
            document['updatedTimestamp'] = getTimestamp(document['updated']);
        }
        const insertResponse = await dbo.dbConnection().collection(this.collection_name).insertOne(document);
        if(insertResponse && insertResponse.insertedId){
            responseData= {
                ...document,
                id: BaseModel.getMongoStringId(document['_id'])
            }
            try {
                delete responseData._id;
            } catch (err) {
                responseData._id = null;
            }
        }
        return responseData;
    }


    /**
     * delete a record
     * @param {*} constraints
     * @return {boolean}
     */
    async delete(constraints) {
        let result = null;
        if (isString(constraints) && constraints.trim().length === 24) {
            constraints = { '_id': BaseModel.getMongoId(constraints) };
        }else if (BaseModel.isMongoId(constraints)) {
            constraints = { '_id': constraints };
        }
        if (!isObject(constraints)) {
            return result;
        }

        try{
            const deleteResult = await dbo.dbConnection().collection(this.collection_name).deleteOne(constraints, { 'limit': 0 });
            if (!empty(deleteResult)) {
                result = constraints;
            }
        }catch(err){}


        return result;
    }

    /**
     * convert string to object id
     * @param id
     * @return {*}
     */
    static getMongoId(id = "") {
        return (!empty(id) && isString(id) && BaseModel.isMongoId(id)) ? dbo.ObjectID(id.trim()) : dbo.ObjectID();
    }

    /**
     * convert object id to string
     * @param id
     * @return {*}
     */
    static getMongoStringId(id = null) {
        return (id && BaseModel.isMongoId(id)) ? `${id}`: '';
    }

    /**
     * check if object id is valid mongo id
     * @param id
     * @return {boolean|*}
     */
    static isMongoId(id) {
        try {
            id = isString(id) ? id.trim() : id;
            return dbo.ObjectID.isValid(id);
        } catch (e) {
            return false;
        }
    }

    /**
     * update a record
     * @param {*} document
     * @return mixed
     */ 
    async update(document, _id) {
        let responseData=null;
        if (!isObject(document)) {
            return responseData;
        }
        document = utf8_convert(document);

        if (isString(_id) && _id.length === 24) {
            _id = BaseModel.getMongoId(_id);
        }

        if (empty(document['updated']) || !isString(document['updated'])) {
            document['updated'] = getFormattedDate();
            document['updatedTimestamp'] = getTimestamp();
        } else{
            document['updatedTimestamp'] = getTimestamp(document['updated']);
        }

        const updateResult = await dbo.dbConnection().collection(this.collection_name).updateOne({ _id: _id }, { $set: document }, { multi: false, upsert: false });
        if(updateResult){
            responseData= {
                ...document,
                id: BaseModel.getMongoStringId(_id)
            }
        
        }
        return responseData;
    }
    

}

module.exports = BaseModel;

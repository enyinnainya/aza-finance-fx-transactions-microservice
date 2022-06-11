
const { empty, isObject, isString, isArray } = require('../lib/utils');

/**
 * set up base functionality for inherited subclasses
 * Class BaseService
 */
class BaseService {
    static collection_name = '';
    static database_name = '';
    static object_class = '';
    static object_class_arguments = [];

    /**
     * uniform expectation of failed response data
     * @param data
     * @return {object}
     */
    static sendFailedResponse(data) {
        let returnData = { success: false };
        if (!empty(data) || data === "0" || data === 0 || data === "") {
            returnData['data'] = data;
        }
        return returnData;
    }

    /**
     * uniform expectation of successful response data
     * @param data
     * @return {object}
     */
    static sendSuccessResponse(data) {
        let returnData = { success: true };
        if (!empty(data) || data === 0 || data === "0" || data === "") {
            returnData['data'] = data;
        }
        return returnData;
    }

    /**
     *
     * @param {*} data
     * @returns
     */
    static sanitizeRequestData(data) {
        if (!empty(data) && isObject(data)) {
            Object.keys(data).forEach((key) => {
                data[key] = BaseService.recursivelySanitize(data[key]);
            })
        }
        return data;
    }

    /**
     *
     * @param {*} data
     * @returns
     */
    static recursivelySanitize(data) {
        if (isObject(data)) {
            Object.keys(data).forEach((key) => {
                let field_value = data[key];
                if (isString(field_value) && field_value.indexOf('%') > -1) {
                    data[key] = decodeURI(field_value);
                }
                if (isObject(field_value)) {
                    data[key] = BaseService.recursivelySanitize(data[key]);
                }
            })
        } else if (isString(data)) {
            data = data.trim();
        }
        return data;
    }

    /**
     * Validating post data with Joi
     * @param {object} schema
     * @param post_data
     * @returns {Promise<void>}
     */
    static async validateJoiPost(schema=null, post_data={}){
        let errors={};
        try{
            if(schema && post_data && schema.validate && typeof schema.validate === "function"){

                const { error } = schema.validate(post_data, {abortEarly: false});
                if(!empty(error) && !empty(error.details) && isArray(error.details)) {
                    error.details.map(errorItem => {
                        let errorMessage = (!empty(errorItem) && !empty(errorItem.message)) ? errorItem.message : 'Field could not be validated, please check your payload and try again.';
                        let errorLabel = (!empty(errorItem) && !empty(errorItem.path) && !empty(errorItem.path[0])) ? errorItem.path[0] : 'field_' + (new Date().getTime());
                        errors = {
                            ...errors,
                            [errorLabel]: errorMessage
                        }
                        return false;
                    });
                }
            }
        }catch(err){}
        return errors;
    }

}

module.exports = BaseService;

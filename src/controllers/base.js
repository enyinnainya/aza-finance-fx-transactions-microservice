/**
 * All shared controller functions for inheriting subclasses
 */

const { isNumber, empty, isObject } = require('../lib/utils');

class BaseController {

   constructor() {}

   /**
    * standard success response object
    * @param res
    * @param errors
    * @param additionalMetaData
    * @param status_code
    */
   static sendFailedResponse(res, errors, status_code= 400, additionalMetaData= {}) {
      errors=(errors && !empty(errors))?errors:null;
      let returnData = { success: false };
      status_code =
         status_code && isNumber(status_code) && parseInt(status_code, 10) > 0
            ? parseInt(status_code, 10)
            : 400;
      if(isObject(additionalMetaData) && !empty(additionalMetaData)) {
         returnData = {
            ...returnData,
            ...additionalMetaData
         }
      }
      returnData['errors'] = errors;
      res.status(status_code).send(returnData);
   }

   /**
    * standard success response object
    * @param res
    * @param data
    * @param additionalMetaData
    * @param status_code
    */
   static sendSuccessResponse(res, data, status_code=200, additionalMetaData= {}) {
      data=(data && !empty(data))?data:null;
      let returnData = { success: true };
      status_code =
          status_code && isNumber(status_code) && parseInt(status_code, 10) > 0
              ? parseInt(status_code, 10)
              : 200;

      if(isObject(additionalMetaData) && !empty(additionalMetaData)) {
         returnData = {
            ...returnData,
            ...additionalMetaData
         }
      }
      returnData['data'] = data;
      res.status(status_code).send(returnData);
   }
}

module.exports = BaseController;

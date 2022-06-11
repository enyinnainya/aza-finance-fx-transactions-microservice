
const date = require('./date');

/**
 * Helper function that checks if supplied parameter is an object type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an object or false if it's not.
 */
exports.isObject = (data = null) => {
   return typeof data === 'object' &&
      Object.prototype.toString.call(data) === '[object Object]'
      ? true
      : false;
};

/**
 * Helper function that checks if supplied parameter is an array or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an array or false if it's not.
 */
exports.isArray = (data = null) => {
   return (typeof data === 'object' &&
      Object.prototype.toString.call(data) === '[object Array]') ||
      Array.isArray(data)
      ? true
      : false;
};

/**
 * Helper function that checks if supplied parameter is a string type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a string or false if it's not.
 */
exports.isString = (data = null) => {
   return typeof data === 'string';
};

/**
 * Helper function that checks if supplied parameter is a number type or not.
 * @param {any} value - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a number or false if it's not.
 */
exports.isNumber = (value = null) => {
   try {
      // return typeof data === "number" || /[0-9]/.test(data);
      return (
         typeof value === 'number' &&
         value === value &&
         value !== Infinity &&
         value !== -Infinity
      );
   } catch (err) {
      return false;
   }
};

/**
 * Helper function that checks if supplied parameter is a boolean type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a boolean type or false if it's not.
 */
exports.isBoolean = (data = null) => {
   return typeof data === 'boolean' || data === true || data === false;
};

/**
 * Helper function that checks if supplied parameter is undefined type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is undefined or false if it's not.
 */
exports.isUndefined = (data = null) => {
   return typeof data === 'undefined' || data == undefined ? true : false;
};

/**
 * Helper function that checks if supplied parameter is defined or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is defined or false if it's not.
 */
exports.isDefined = (data = null) => {
   return typeof data !== 'undefined';
};

/**
 * Helper function that checks if supplied parameter is null type or not.
 * @param {any} data - Represents the data to run check on. Accepts international numbers too
 * @returns {boolean} - Returns true if supplied parameter (data) is a valid phone number or false if it's not.
 */
exports.isNull = (data = null) => {
   return data === null;
};

/**
 * Cloned Helper function that checks if supplied parameter is empty (has no value) or not.
 * Cloned from the isEmpty() function
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.empty = (data = null) => {
   return this.isEmpty(data);
};

/**
 * Helper function that checks if supplied parameter is empty (has no value) or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.isEmpty = (data = null) => {
   let rtn = false;
   if (this.isString(data) && (data === '' || data.trim() === '')) rtn = true;
   else if (this.isNumber(data) && data === 0) rtn = true;
   else if (this.isBoolean(data) && data === false) rtn = true;
   else if (this.isObject(data) && Object.values(data).length === 0) rtn = true;
   else if (this.isArray(data) && data.length === 0) rtn = true;
   else if (this.isUndefined(data)) rtn = true;
   else if (this.isNull(data)) rtn = true;
   else if (data) rtn = false;

   return rtn;
};

/**
 * Get the float value of a variable
 * @param {*} value The scalar value being converted to an float
 * @returns {number} The float value of var on success, or 0 on failure. Empty arrays and objects return 0, non-empty arrays and objects return 1.
 * Strings will most likely return 0 although this depends on the leftmost characters of the string. The common rules of float casting apply.
 */
exports.floatval = (value) => {
   try {
      if (this.isString(value) || this.isNumber(value)) {
         value = parseFloat(value);
         if (isNaN(value)) return 0;
      } else if (!this.empty(value)) {
         value = 1;
      } else value = 0;

      return value;
   } catch (e) {
      return 0;
   }
};

/**
 * function to convert array strings to utf8 encoding
 * @param {*} record
 * @returns
 */
exports.utf8_convert = (record) => {
   //array conversion
   if (this.isObject(record) && !this.empty(record)) {
      //loop through each value and convert to utf8
      Object.keys(record).forEach((rec_key) => {
         let value=record[rec_key];
         if (this.isString(value) && !this.empty(value)) {
            try {
               value = this.convert_smart_quotes(value);
               record[rec_key] = this.convertUTF7toUTF8(value);
            } catch (e){}
         } else if (this.isObject(value)) {
            record[rec_key] = this.utf8_convert(value);
         }
      })
   } else if (this.isString(record) && !this.empty(record)) {
      //just a string conversion
      try {
         record = this.convert_smart_quotes(record);
         record = this.convertUTF7toUTF8(record);
      } catch (e){}
   }
   return record;
}

/**
 * Function to convert quotes
 * @param {string} str
 * @returns
 */
exports.convert_smart_quotes = (str) => {
   if (this.isString(str)) return str;
   const search = [String.fromCharCode(145), String.fromCharCode(146), '´', '′', '’', '‘', String.fromCharCode(147), String.fromCharCode(148), String.fromCharCode(151)];
   const replace = ["'", "'", "'", "'", "'", "'", '"', '"', '-'];

   search.map((s, i) => {
      str.replace(s, replace[i]);
   })
   return str;
}


/**
 * Function to utf7 to utf8 chars
 * @param {string} str
 * @returns
 */
exports.convertUTF7toUTF8 = (str)=> {
   let b64Token = /\+([a-z\d/+]*-?)/gi,
       hex, len, replace, i;

   return str.replace(b64Token, function(match, grp) {
      hex = Buffer.from(grp, 'base64');
      len = hex.length >> 1 << 1;
      replace = '';
      i = 1;

      for(i; i < len; i = i + 2) {
         replace += String.fromCharCode(hex.readUInt16BE(i - 1));
      }

      return replace;
   });
}

/**
 * get timestamp from existing time or current timestamp
 * @param time
 * @return {*}
 */
exports.getTimestamp = (time) => {
   let returnTime = null;
   if(!this.empty(time)){
      try {
         returnTime = new Date(time).getTime();
      } catch(e){}
   }else{
      returnTime = (new Date()).getTime();
   }
   if(!this.empty(returnTime)){
      returnTime=parseInt((returnTime/1000).toString());
   }

   return returnTime;
}

/**
 * Function to format date
 * @param existingDate
 * @param format
 * @return {*}
 */
exports.getFormattedDate = (format = "F j, Y, g:i a T", existingDate=null) => {
   const timestamp = this.getTimestamp(existingDate);
   return date(format, parseInt(timestamp));
}

/***
 * Function to format Numbers decimals, etc.
 * @param number
 * @param decimals
 * @param dec_point
 * @param thousands_sep
 * ****/
exports.number_format = (number, decimals, dec_point, thousands_sep) => {

   // Strip all characters but numerical ones.
   number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
   let n = !isFinite(+number) ? 0 : +number,
       prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
       sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
       dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
       s = '',
       toFixedFix = function (n, prec) {
          var k = Math.pow(10, prec);
          return '' + Math.round(n * k) / k;
       };

   s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
   if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
   }
   if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
   }
   return s.join(dec);
}
var aquajsErrorConstant = require('./../../config/env/error-constants.json');

var AquaJsErrors = function () {
  var errorConfigArray = [];
  this.errorConfigArray = errorConfigArray;

};

/**
 * AquaJS Error Constructor to list all the errors
 * Lets say you wanted to send multiple errors to the browser
 * you can push the list of errors to the errors list and pass that list while throwing the aqua js error
 * Framework will take care of sending the list of error in a json format
 * @api public
 * @param
 * @see
 * @return {Aquajs Error Object}
 */
AquaJsErrors.prototype.addError = function (configName, property, message, more_info) {
  var errorConfig;
  if (undefined !== aquajsErrorConstant) {
    errorConfig = aquajsErrorConstant[configName];
  }
  if (undefined !== errorConfig) {
    if (undefined !== property || null !== property) {
      errorConfig.property = property;
    }
    if (undefined !== message || null !== message) {
      errorConfig.message = message;
    }
    if (undefined !== more_info || null !== more_info) {
      errorConfig.more_info = more_info;
    }

  }
  this.errorConfigArray.push(errorConfig);
};

AquaJsErrors.prototype.getErrors = function () {
  return this.errorConfigArray;
};

AquaJsErrors.prototype.hasError = function () {
  return this.errorConfigArray.length > 0;
};

module.exports = AquaJsErrors;
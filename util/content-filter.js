/**
 * Hacker mate helps to filter bad request or contents and
 * throws 403 error.
 * Sits in the middleware of the Express framework and checks each request.
 *
 * @param options
 * @returns {Function}
 */

module.exports = function hackerMate(options) {

	options = options || {};

	var checkNames = options.checkNames || true;
	var typeList = options.typeList || ['object', 'function'];
	var urlBlackList = options.urlBlackList || ['%7B','%24','%2F','%5C'];
	var bodyBlackList = options.bodyBlackList || ['$'];
	var methodList = options.methodList || ['GET', 'POST', 'PUT', 'DELETE'];
	var urlMessage = options.urlMessage || 'A forbidden character set has been found in URL: ';
	var bodyMessage = options.bodyMessage || 'A forbidden string has been found in form data: ';

	return function filter(req, res, next) {
		/* Only examine the valid methodList */
		if (methodList.indexOf(req.method) === -1) {
			return next();
		}
		var found = null;
		/* Examining the URL */
		for (var i = 0; i < urlBlackList.length; i++){
			if (req.originalUrl.indexOf(urlBlackList[i]) !== -1) {
				found = urlBlackList[i];
				break;
			}
		}
		if (found) {
			return res.status(403).send(urlMessage + found);
		}

		/* Examining the req.body object If there is a req.body object it must be checked */
		if (req.body && Object.keys(req.body).length) {
			convertJSONString(req.body, typeList, checkNames, function(str){
				for (var i = 0; i < bodyBlackList.length; i++){
					if (str.indexOf(bodyBlackList[i]) !== -1) {
						found = bodyBlackList[i];
						break;
					}
				}
				if (found) {
					return res.status(403).send(bodyMessage + found);
				}
				next();
			});
		} else {
			next();
		}
	};
};

function convertJSONString(json, typeList, checkNames, callback) {

	var str = '', level = 1;
    repeat(json);
	function repeat(data) {
		var keys = Object.keys(data);
		// Never callback if keys.length == 0
		if (keys.length === 0) {
			callback('');
		}
		for (var i = 0; i < keys.length; i++) {
			if (typeList.indexOf(typeof data[keys[i]]) !== -1) {
				//null is an object too. So check the value `data[keys[i]]`
				if (typeof data[keys[i]] === 'object' && data[keys[i]]) {
					if (checkNames) {
						// if the object is an array get the elements
						if (data[keys[i]].length) {
							str += data[keys[i]].join('');
						} else {
							// else this is an object	so get the property names
							str += Object.getOwnPropertyNames(data[keys[i]]);
						}
					}
					/************************************************************************************************
					* If an object is the latest element of a for loop don't increase. Because `else { level-- }`
					* block never works!
					************************************************************************************************/
					if (i !== keys.length - 1)	{
						level++;
					}
                    repeat(data[keys[i]]);
				} else {
					if (i === keys.length - 1) {
						level--;
					}
					str += (checkNames) ? keys[i] + data[keys[i]] : data[keys[i]];
					if (level === 0 && i === keys.length - 1) {
						callback(str);
					}
				}
			} else {
				if (i === keys.length - 1) {
					level--;
				}
				if (level === 0 && i === keys.length - 1) {
					callback(str);
				}
			}
		}
	}
}

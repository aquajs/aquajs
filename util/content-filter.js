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

	var urlBlackList = options.urlBlackList || ['%7B','%24','%2F','%5C'];
	var bodyBlackList = options.bodyBlackList || ['$','=','<','>','(',')',';'];
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
			var str = JSON.stringify(req.body);
			for (var i = 0; i < bodyBlackList.length; i++){
				if (str && str.indexOf(bodyBlackList[i]) !== -1) {
					found = bodyBlackList[i];
					break;
				}
			}
			if (found) {
				return res.status(403).send(bodyMessage + found);
			}
		}
		next();
	};
};
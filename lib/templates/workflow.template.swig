var restify = require('restify'),
    path = require('path'),
    wf_utils = require(path.join($dirPaths.serverDir,'utils','wf_utils')),
    wf_const = require(path.join($dirPaths.serverDir,'constants','wf_constants')),
    AquaJsError = require("aquajs-error");

var {{methodDef.nickname}} = {
  startJob: function (job, next, cb) {
    try {
      //time out for the request to wait for the url call
      var requestTimeout = 5000;
      //number of times the retry will happen in case of gateway time out
      var retry = {
        'retries': 2
      };

      var client = restify.createJsonClient({
        url: wf_utils.getHostUrl(job.wf_host_port_list, wf_const.PROJECT),headers :job.reqHeaders, requestTimeout: requestTimeout, retry: retry
      });

      return client.del(job.reqUrl, function (err, req, res, obj) {
        // Call the Microservice and act on the response...
        var data = {};
        if (err) {
          if( res.headers != null && res.headers != "null" ) {
            err.status = res.headers['status'];
          }
          return cb(err);
        } else {
          data.authHeader = res.headers['authorization'];
          data.contentType = res.headers['content-type'];
          data.result = obj;
          cb(null, data);
          // This is just a message to track the Workflow...
        }
      });
    } catch (err) { // send the error response to the user
      err.status = res.headers['status'];
      return next(new AquaJsError(err));
    }
  }
};

module.exports = deleteVc;
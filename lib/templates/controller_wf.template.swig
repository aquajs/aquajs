/**
 * Created by etuscano on 7/29/14.
 * Controllers for workflow
 * workflow controller which called by worker and passes the call to the
 * corresponding workflow and sends back the orchestrated data from multiple microservices
 * we need to  pass the req params, body params, query params and request headers to the workflow
 * Injects the custom response header before sending back the response
 */

var cwd = process.cwd(),
  path = require('path'),
  aquaJsError = require('aquajs-error');

var wf_dir = path.join($dirPaths.serverDir, 'workflows', {{basename}}),
  wf_utils = require(path.join($dirPaths.serverDir, 'utils', 'wf_utils'));

var BaseController = {
  getWorkflow: function (req, res, next) {
    var wf = require(path.join(wf_dir, wf_utils.getWorkFlowMethod(req.method, req.url)));
    var job = wf_utils.getWorkflowJob(req);
    var workFlowMethod = wf_utils.getWorkFlowMethod(req.method, req.url);
    $logger.info("Starting the workflow controller for method get and url:  -- > : " + workFlowMethod);

    wf.startJob(job, next,
      function (err, data) {

        if (err || data == "Error") {
          $logger.error("Error occurred while calling the workflow controller :  " + workFlowMethod + "-- > error: -- > " + err);
          return next(new aquaJsError(err));
        } else {
          res.header("Content-Type", data.contentType);
          res.header("authorization", data.authHeader);
          $logger.info("Workflow controller : --> " + workFlowMethod + "  executed successfully" );
          res.send(data.result);
        }
      });
  },
  postWorkflow: function (req, res, next) {
    var wf = require(path.join(wf_dir, wf_utils.getWorkFlowMethod(req.method, req.url)));
    var job = wf_utils.getWorkflowJob(req);
    var workFlowMethod = wf_utils.getWorkFlowMethod(req.method, req.url);
    $logger.info("Starting the workflow controller for method get and url  :  -- > : " + workFlowMethod);

    wf.startJob(job, next,
      function (err, data) {
        if (err || data == "Error") {
          $logger.error("Error occurred while calling the workflow controller :  " + workFlowMethod + "-- > error: -- > " + err);
          return next(new aquaJsError(err));
        } else {
          res.header("Content-Type", data.contentType);
          res.header("authorization", data.authHeader);
          $logger.info("Workflow controller : --> " + workFlowMethod + "  executed successfully");
          res.send(data.result);
        }
      });
  },
  putWorkflow: function (req, res, next) {
    var wf = require(path.join(wf_dir, wf_utils.getWorkFlowMethod(req.method, req.url)));
    var job = wf_utils.getWorkflowJob(req);
    var workFlowMethod = wf_utils.getWorkFlowMethod(req.method, req.url);
    $logger.info("Starting the workflow controller for method get and url  :  -- > : " + workFlowMethod);

    wf.startJob(job, next,
      function (err, data) {
        if (err || data == "Error") {
          $logger.error("Error occurred while calling the workflow controller :  " + workFlowMethod + "-- > error: -- > " + err);
          return next(new aquaJsError(err));
        } else {
          res.header("Content-Type", data.contentType);
          res.header("authorization", data.authHeader);
          $logger.info("Workflow controller : --> " + workFlowMethod + "  executed successfully");
          res.send(data.result);
        }
      });
  },
  patchWorkflow: function (req, res, next) {
    var wf = require(path.join(wf_dir, wf_utils.getWorkFlowMethod(req.method, req.url)));
    var job = wf_utils.getWorkflowJob(req);
    var workFlowMethod = wf_utils.getWorkFlowMethod(req.method, req.url);
    $logger.info("Starting the workflow controller for method get and url  :  -- > : " + workFlowMethod);

    wf.startJob(job, next,
      function (err, data) {
        if (err || data == "Error") {
          $logger.error("Error occurred while calling the workflow controller :  " + workFlowMethod + "-- > error: -- > " + err);
          return next(new aquaJsError(err));
        } else {
          res.header("Content-Type", data.contentType);
          res.header("authorization", data.authHeader);
          $logger.info("Workflow controller : --> " + workFlowMethod + "  executed successfully");
          res.send(data.result);
        }
      });
  },
  deleteWorkflow: function (req, res, next) {
    var wf = require(path.join(wf_dir, wf_utils.getWorkFlowMethod(req.method, req.url)));
    var job = wf_utils.getWorkflowJob(req);
    var workFlowMethod = wf_utils.getWorkFlowMethod(req.method, req.url);
    $logger.info("Starting the workflow controller for method get and url  :  -- > : " + workFlowMethod);

    wf.startJob(job, next,
      function (err, data) {
        if (err || data == "Error") {
          $logger.error("Error occurred while calling the workflow controller :  " + workFlowMethod + "-- > error: -- > " + err);
          return next(new aquaJsError(err));
        } else {
          res.header("Content-Type", data.contentType);
          res.header("authorization", data.authHeader);
          $logger.info("Workflow controller : --> " + workFlowMethod + "  executed successfully");
          res.send(data.result);
        }
      });
  }
};

module.exports = BaseController;
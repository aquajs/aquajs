var path = require('path');

/*####################################
 Workflow routes to forward to universal base controller based on the route method
 ####################################*/

var baseRoute = function(app) {
  $wf_const = require(path.join($dirPaths.serverDir,'constants','wf_constants'));

  //initialize the base controller here
  var baseController = require(path.join($dirPaths.controllersDir, 'baseController'));

  app.all('*',  function (req, res,next) {
    switch(req.method) {
      case "GET":
        baseController.getWorkflow(req,res,next);
        break;
      case "POST":
        baseController.postWorkflow(req,res,next);
        break;
      case "PUT":
        baseController.putWorkflow(req,res,next);
        break;
      case "PATCH":
        baseController.patchWorkflow(req,res,next);
        break;
      case "DELETE":
        baseController.deleteWorkflow(req,res,next);
        break;
    }
  });
};
module.exports = baseRoute;
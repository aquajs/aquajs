// bootstrap is responsible for setting up the entire environment,
// including several globals ($dirPaths, $config, $logger, and $app)

GLOBAL.$dirPaths = require(process.cwd() + '/config/dirPaths');

var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  AquaJsLogger = require('aquajs-logger'),
  AquaJsPrecog = require('aquajs-precog'),
  swagger = require("swagger-express"),
  async = require("async"),
  Waterline = require('waterline'),
  persist = require('persist'),
  nodeUtilities = require('./nodeUtilities');


module.exports = function (config) {
  GLOBAL.$config = config;

  var app = express();
  GLOBAL.$app = app;

  initLogger(config.app.logconfpath);
  GLOBAL.$logger = AquaJsLogger.getLogger();
  GLOBAL.$winston = AquaJsLogger.getWinston();
  initPrecogLgger(app, config.app.logconfpath, AquaJsLogger.getWinston(), $logger);

  require('./express')(app);
 if(!$loadModel){
   nodeUtilities.initORM(config.enableWaterline, config.enablePersist, config.app.dbConfList, app);
 }

  initSwagger(app);

  // Batch process related properties will get initialized based on the batchProcessServer
  if (config.batchProcessServer) {
    initScheduler(config.app.schedulerconfpath, app);
  }

  return app;
};

function initScheduler(schedulerconfpath, app) {
  // TODO: refactor so no aquajs-cli path component, no hard coded cron-methods
  /*
   var cronMethods = require(serverDir + 'aquajs-cli/scheduler/cron-methods.js');
   var config = require(schedulerconfpath);
   var scheduler = require('aquajs-scheduler');
   scheduler.init(config, cronMethods);
   scheduler.enableSchedulerUI(app);
   scheduler.schedule();
   */
}

function initLogger(logpath) {
  var logJsonConfig = require(logpath);
  AquaJsLogger.init(logJsonConfig);
}

function initPrecogLgger(app, logpath, winston, logger) {
  var logJsonConfig = require(logpath);
  AquaJsPrecog.init(app, logJsonConfig, winston, logger);
}


function initSwagger(app) {
  // Serve up swagger ui at /swagger via static route
  var docs_handler = express.static(path.join(process.cwd(), 'node_modules', 'aquajs-swagger-ui', 'dist'));
  var setSwaggerContext = true;
  var pathList = [];

  var list = fs.readdirSync(path.join($dirPaths.serverDir, 'schema'));
  list.forEach(function (file) {
    pathList.push(path.join($dirPaths.serverDir, 'schema', file));
  });

  app.get(/^\/apidoc(\/.*)?$/, function (req, res, next) {
    if (setSwaggerContext) {
      var urlPath = req.protocol + "://" + req.get('host');
      app.use(swagger.init(app, {
        apiVersion: '1.0',
        swaggerVersion: '1.0',
        basePath: urlPath,
        swaggerURL: '/swagger',
        swaggerJSON: '/api-docs.json',
        swaggerUI: path.join(process.cwd(), 'node_modules', 'aquajs-swagger-ui', 'dist'),
        apis: pathList
      }));
      // Configures the app's base path and api version.
      setSwaggerContext = false;
    }

    // express static barfs on root url w/o trailing slash
    if (req.url === '/apidoc') {
      res.writeHead(302, {'Location': req.url + '/'});
      res.end();
      return;
    }


    // take off leading /docs so that connect locates file correctly
    req.url = req.url.substr('/apidoc'.length);
    return docs_handler(req, res, next);

  });


  app.get(/^\/apidocSample(\/.*)?$/, function (req, res, next) {
    if (req.url === '/apidocSample') {
      var sampleData = require("../node_modules/aquajs-microservice/sampleData/sampleData.js");
      res.write("<a href='./apidocSample' target='_blank' style='color:black;'>Open this link in separate window</a>");
      res.write("</br>Sample Order object for POST:<pre>" + JSON.stringify(sampleData.orderPost, null, 2));
      res.write("</pre>Sample Order object for PUT:<pre>" + JSON.stringify(sampleData.orderPut, null, 2));
      res.write("</pre>Sample Pizza object for POST:<pre>" + JSON.stringify(sampleData.pizzaPost, null, 2));
      res.write("</pre>");
      res.end();
      return;
    }
  });
}
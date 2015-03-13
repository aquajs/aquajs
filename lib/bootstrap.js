// bootstrap is responsible for setting up the entire environment,
// including several globals ($dirPaths, $config, $logger, and $app)

var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    AquaJsLogger = require('aquajs-logger'),
    swagger = require("swagger-express"),
    async = require("async"),
    Waterline = require('waterline'),
    persist = require('persist'),
    connUtils = require('./connUtils'),
    monitor = require('./monitor');

GLOBAL.$dirPaths = require(path.join(process.cwd(), 'config', 'dirPaths'));

module.exports = function (config) {
  GLOBAL.$config = config;

  initMonitor(config);

  var app = express();
  GLOBAL.$app = app;

  initLogger(config.app.logconfpath);
  GLOBAL.$logger = AquaJsLogger.getLogger();
  GLOBAL.$winston = AquaJsLogger.getWinston();
  var logConfig = require(config.app.logconfpath);
  if (logConfig.logConfig.precog) {
    AquaJsPrecog = require('aquajs-precog');
    initPrecogLgger(app, config.app.logconfpath, AquaJsLogger.getWinston(), $logger);
  }

  require('./express')(app);
  if (config.app.loadModel != undefined && config.app.loadModel && !$initModel && fs.existsSync($dirPaths.modelsDir)) {

    connUtils.initORM(config.enableWaterline, config.enablePersist, config.app.dbConfList, app);
  }

  initSwagger(app);

  return app;
};

function initLogger(logpath) {
  var logJsonConfig = require(logpath);
  GLOBAL.$appId = "[aquajs-logger]";
  AquaJsLogger.init(logJsonConfig, $appId);
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
  if (fs.existsSync(path.join($dirPaths.serverDir, 'schema'))) {
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
        var sampleData = require(path.join($dirPaths.serverDir, 'data', 'sampleData'));
        res.write("<a href='./apidocSample' target='_blank' style='color:black;'>Open this link in separate window</a>");
        res.write("</br>Sample object for POST:<pre>" + JSON.stringify(sampleData.samplePost, null, 2));
        res.write("</pre>Sample object for PUT:<pre>" + JSON.stringify(sampleData.samplePut, null, 2));
        res.write("</pre>");
        res.end();
      }
    });
  }
}

function initMonitor(config) {
  monitor.configure(config.monitor).start();
}


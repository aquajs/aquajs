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
    Waterline = require('waterline');


module.exports = function(config) {
  GLOBAL.$config = config;

  var app = express();
  GLOBAL.$app = app;

  initLogger(config.app.logconfpath);
  GLOBAL.$logger = AquaJsLogger.getLogger();
  GLOBAL.$winston = AquaJsLogger.getWinston();
  initPrecogLgger(app,config.app.logconfpath,AquaJsLogger.getWinston(),$logger);

  require('./express')(app);

  initORM(config.enableWaterline, config.enablePersist, config.app.dbConfList, app);

  initSwagger(app);

  // Batch process related properties will get initialized based on the batchProcessServer
  if ("true" == config.batchProcessServer) {
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

function initPrecogLgger(app,logpath,winston,logger) {
  var logJsonConfig = require(logpath);
  AquaJsPrecog.init(app,logJsonConfig,winston,logger);
}


function initSwagger(app) {
  // Serve up swagger ui at /swagger via static route
  var docs_handler = express.static(path.join(process.cwd(), 'node_modules', 'aquajs-swagger-ui', 'dist'));
  var setSwaggerContext = true;
  var pathList = [];

  var list = fs.readdirSync(path.join($dirPaths.serverDir, 'schema'));
  list.forEach(function(file) {
    pathList.push(path.join($dirPaths.serverDir, 'schema', file));
  });

  app.get(/^\/apidoc(\/.*)?$/, function(req, res, next) {
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
}
function initORM(enableWaterline, enablePersist, dbConfList, app) {

  var eachModel, orm;
  async.each(dbConfList, function(eachConfig, callback) {
    var models_path = path.join($dirPaths.serverDir, 'models');
    var modelList = fs.readdirSync(models_path);
    async.each(modelList, function (file, callback) {
      var newPath = path.join(models_path, file);
      var stat = fs.statSync(newPath);
      if (stat.isFile()) {
        try {
          eachModel = require(newPath);
        }
        catch (ex) {
          console.log(ex);
        }
      }
      if (eachModel.prototype!==undefined && eachModel.prototype.adapter!==undefined && enableWaterline) {
        if(orm === undefined){
          orm = new Waterline();
        }
        orm.loadCollection(eachModel);
      }
      callback();
    }, function (err) {
      if (enableWaterline) {
        orm.initialize(eachConfig, function (err, models) {
          try {
            $app.models = models.collections;
            $app.connections = models.connections;
          } catch (e) {
            console.error("error: ensure mongo is running before starting microservice");
            process.exit(1);
          }

        });
      }
      if (enablePersist) {
        // TODO: code for persist model initialization
      }
    });

  }, function(err) {
    if (err) {
      AquaJsLogger.getLogger().error(err);
    }
  });
}


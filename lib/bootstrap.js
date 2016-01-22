// bootstrap is responsible for setting up the entire environment,
// including several globals ($dirPaths, $config, $logger, and $app)

var express = require('express'),
    fs = require('fs'),
    path = require('path'),
    swagger = require("swagger-express"),
    async = require("async"),
    connUtils = require(path.join('.','..','util','connUtils')),
    loggerUtils = require(path.join('.','..','util','loggerUtils')),
    monitor = require('./monitor'),
    jsonSafeStringify = require('json-stringify-safe');

    require(path.join('.','..','constants','GlobalConstants')); //for all the global constants


module.exports = function (config) {
  $config = config;

  initMonitor(config);

  var app = express();
  $app = app;

  loggerUtils.initLogger(config.app.logconfpath); //initialize the

 require('./middleware')(app);

  if (config.app.loadModel && !$initModel && fs.existsSync($dirPaths.modelsDir)) {
    $enableWaterline=(config.connectionType==='mongo-orm');
    $enablePersist =(config.connectionType==='oracle-orm');

    connUtils.initORM(config.app.connectionConfig, app);
  }

  initSwagger(app);

  return app;
};

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

    var context = process.env.apidoc || 'apidoc';

    var regex = new RegExp('^\\/' + context + '(\\/.*)?$');

    app.get(regex, function (req, res, next) {
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
      if (req.url === ('/' + context)) {
        res.writeHead(302, {'Location': req.url + '/'});
        res.end();
        return;
      }

      // take off leading /docs so that connect locates file correctly
      req.url = req.url.substr(('/' + context).length);
      return docs_handler(req, res, next);

    });


    app.get(/^\/apidocSample(\/.*)?$/, function (req, res, next) {
      if (req.url === '/apidocSample') {
        var sampleData = require(path.join($dirPaths.serverDir, 'data', 'SampleData'));
        res.write("<a href='./apidocSample' target='_blank' style='color:black;'>Open this link in separate window</a>");
        if(sampleData) {
          if(sampleData.sampleGet) {
            res.write("</br>Sample Data for Get:<pre>" + jsonSafeStringify(sampleData.sampleGet, null, 2));
          }
          if(sampleData.samplePost) {
            res.write("</br>Sample Data for Post:<pre>" + jsonSafeStringify(sampleData.samplePost, null, 2));
          }
          if(sampleData.samplePut) {
            res.write("</br>Sample Data for Put:<pre>" + jsonSafeStringify(sampleData.samplePut, null, 2));
          }
          if(sampleData.samplePatch) {
            res.write("</br>Sample Data for Patch:<pre>" + jsonSafeStringify(sampleData.samplePatch, null, 2));
          }
          if(sampleData.sampleDelete) {
            res.write("</br>Sample Data for Delete:<pre>" + jsonSafeStringify(sampleData.sampleDelete, null, 2));
          }
        }
        res.write("</pre>");
        res.end();
      }
    });
  }
}

function initMonitor(config) {
  monitor.configure(config.monitor).start();
}

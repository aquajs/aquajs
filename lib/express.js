var express = require('express'),
//cors = require('cors');
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    appPath = process.cwd(),
    logger = require('aquajs-logger'),
    expressValidator = require('express-validator'),
    beautify = require('js-beautify').js_beautify,
    commonUtil = require('./../util/commonUtils'),
    config = require(path.join(appPath,'config/env/'+process.env.NODE_ENV+'_log_config.json')),
    templateDir = path.join(__dirname,'..','templates');

module.exports = function (app) {

  // false for all environments except development
  app.set('showStackError', false);
  app.use(expressValidator());

  // Prettify HTML
  app.locals.pretty = true;

  // cache=memory or swig dies in NODE_ENV=production
  if (process.env.NODE_ENV == 'production') {
    app.locals.cache = 'memory';
  }

  // Should come before express.static (if used) to ensure content is compressed
  app.use(compression({
    filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    // levels 0-9, where 0 = no compression (fastest) and 9 = best compression (slowest)
    level: 9
  }));




  app.use(function(req,res,next){
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    next();
  });

  if (process.env.NODE_ENV === 'development') {
    app.set('showStackError', true);
  }

  app.enable('jsonp callback');

  // Should come before session (if used)
  app.use(cookieParser());

  // Request body parsing middleware should be above method-override
  // https://github.com/expressjs/body-parser#bodyparserurlencodedoptions
  // extended: true means use qs for parsing
  // https://www.npmjs.com/package/qs

  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(require('method-override')());

  // Routes should be last
  bootstrapRoutes(app);

  var envName = app.get('env');
  if (envName === 'production') {
    app.use(prodErrors);
  }
  if (envName === 'qa') {
    app.use(qaErrors);
  }
  if (envName === 'uat') {
    app.use(uatErrors);
  } else {
    app.use(devErrors);
  }

  // Initializing routes from the server/routes directory
  function bootstrapRoutes(app) {
    var routesPath = path.join(appPath, 'routes');
    if (fs.existsSync(routesPath)) {
      var walk = function (routes_path) {
        fs.readdirSync(routes_path).forEach(function (file) {
          var newPath = routes_path + '/' + file;
          var stat = fs.statSync(newPath);
          if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
              require(newPath);
            }
            // We skip the app/routes/middlewares directory as it is meant to be
            // used and shared by routes as further middlewares and is not a
            // route by itself
          } else if (stat.isDirectory() && file !== 'middlewares') {
            walk(newPath);
          }
        });
      };
      walk(routesPath);
    }
  }
};

// development error handler will print the stack traces

devErrors = function (err, req, res, next) {
  var errorMessage = err.errorJson;
  var errorPrefix = '';
  var errorSuffix = '';
  if (errorMessage instanceof Array) {
    errorPrefix = '{"errors":';
    errorSuffix = '}';
  }else {
    errorPrefix = '{"error":';
    errorSuffix = '}';
  }
  res.status(err.status || 500).send(beautify(errorPrefix +
      JSON.stringify(errorMessage) + errorSuffix,
      {indent_size: 2}));
};

// qa error handler will print the stack traces

qaErrors = function (err, req, res, next) {
  if (typeof err === 'object') {
    res.status(err.status || 500).send(err.errorJson);
  } else {
    var errorPrefix = '';
    errorSuffix = '';
    //for single errors
    if (err.errorJson.errors == undefined) {
      errorPrefix = '{"error":';
      errorSuffix = '}';
    }
    res.status(err.status || 500).send(beautify(errorPrefix +
        JSON.stringify(err) + errorSuffix,
        {indent_size: 2}));
  }
};

// uat error handler will print the stack traces

uatErrors = function (err, req, res, next) {
  if (typeof err === 'object') {
    res.status(err.status || 500).send(err.errorJson);
  } else {
    var errorPrefix = '';
    errorSuffix = '';
    //for single errors
    if (err.errorJson.errors == undefined) {
      errorPrefix = '{"error":';
      errorSuffix = '}';
    }
    res.status(err.status || 500).send(beautify(errorPrefix +
        JSON.stringify(err) + errorSuffix,
        {indent_size: 2}));
  }
};


// prod error handler will print the stack traces

prodErrors = function (err, req, res, next) {
  if (typeof err === 'object') {
    res.status(err.status || 500).send(err.errorJson);
  } else {
    var errorPrefix = '';
    errorSuffix = '';
    //for single errors
    if (err.errorJson.errors == undefined) {
      errorPrefix = '{"error":';
      errorSuffix = '}';
    }
    res.status(err.status || 500).send(beautify(errorPrefix +
        JSON.stringify(err) + errorSuffix,
        {indent_size: 2}));
  }
};


//for graceful error handling of the express
process.on('uncaughtException', function (err) {
  var errorStack = commonUtil.getStackTrace(err);
  console.error(errorStack);
  var templateContext = {
    errorMessage: JSON.stringify(errorStack)
  };
  var mailContext = {
    from: config.logConfig.email.from,
    to: config.logConfig.email.to,
    subject: errorStack.stack[0], //to fetch the first line of the error
    format: 'html'
  }
  var template= 'error.html';
  commonUtil.sendEmail(config.logConfig.email,templateDir,template,templateContext,mailContext)
});

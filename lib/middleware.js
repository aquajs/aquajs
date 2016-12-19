var express = require('express'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    helmet = require('helmet'),
    filter = require('./../util/content-filter'),
    appPath = process.cwd(),
    logger = require('aquajs-logger'),
    expressValidator = require('express-validator'),
    commonUtil = require('./../util/commonUtils');

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
      return (/javascript|css/).test(res.getHeader('Content-Type'));
    },
    // levels 0-9, where 0 = no compression (fastest) and 9 = best compression (slowest)
    level: 9
  }));


  app.use('/jsdoc', express.static(process.cwd() + '/public/jsdoc'));
  app.use('/coverage', express.static(process.cwd() + '/public/coverage'));
  app.use('/style', express.static(process.cwd() + '/public/eslint'));
  app.use('/apidocs2', express.static(path.join(process.cwd(),'dist')));

  app.use(function(req,res,next){
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    next();
  });

  app.use(function(req,res,next){
    if (req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'} );
      res.end(/* icon content here */);
    } else {
      next();
    }
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

    //Content filter to avoid hacks and bad request
    app.use(helmet());
    app.use(filter());

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
  if(err.errors){
      if(err.errors.length ==1) {
        res.status(err.errors[0].status || 400).send(err);
      }else if(err.errors.length >1) {
        res.status(400).send(err);
      }
  }else if(err.message){
    var errors = [], error = {}, errRoot = {};
    error.status = 400 ;
    error.statusCode =  40000;
    error.message = error.moreinfo =  err.message || err;
    errors.push(error);
    errRoot.errors = errors ;
    res.status(400).send(errRoot);
  }
};

// qa error handler will print the stack traces

qaErrors = function (err, req, res, next) {
  if(err.errors){
      if(err.errors.length ==1) {
        res.status(err.errors[0].status || 400).send(err);
      }else if(err.errors.length >1) {
        res.status(400).send(err);
      }
  }else if(err.message){
    var errors = [], error = {}, errRoot = {};
    error.status = 400 ;
    error.statusCode =  40000;
    error.message = error.moreinfo =  err.message || err;
    errors.push(error);
    errRoot.errors = errors ;
    res.status(400).send(errRoot);
  }
};
// uat error handler will print the stack traces

uatErrors = function (err, req, res, next) {
  if(err.errors){
      if(err.errors.length ==1) {
        res.status(err.errors[0].status || 400).send(err);
      }else if(err.errors.length >1) {
        res.status(400).send(err);
      }
  }else if(err.message){
    var errors = [], error = {}, errRoot = {};
    error.status = 400 ;
    error.statusCode =  40000;
    error.message = error.moreinfo =  err.message || err;
    errors.push(error);
    errRoot.errors = errors ;
    res.status(400).send(errRoot);
  }
};

// prod error handler will print the stack traces

prodErrors = function (err, req, res, next) {
  if(err.errors){
      if(err.errors.length ==1) {
        res.status(err.errors[0].status || 400).send(err);
      }else if(err.errors.length >1) {
        res.status(400).send(err);
      }
  }else if(err.message){
    var errors = [], error = {}, errRoot = {};
    error.status = 400 ;
    error.statusCode =  40000;
    error.message = error.moreinfo =  err.message || err;
    errors.push(error);
    errRoot.errors = errors ;
    res.status(400).send(errRoot);
  }
};


//for graceful error handling of the express
process.on('uncaughtException', function (err) {
  var errorStack = commonUtil.getStackTrace(err);
  console.error(new Date().toISOString()+ " AQUA-JS-ERROR: ", errorStack);
});

var express = require('express'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    appPath = process.cwd();

module.exports = function(app) {

  // false for all environments except development
  app.set('showStackError', false);

  // Prettify HTML
  app.locals.pretty = true;

  // cache=memory or swig dies in NODE_ENV=production
  if (process.env.NODE_ENV == 'production') {
    app.locals.cache = 'memory';
  }

  // Should come before express.static (if used) to ensure content is compressed
  app.use(compression({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    // levels 0-9, where 0 = no compression (fastest) and 9 = best compression (slowest)
    level: 9
  }));

  if (process.env.NODE_ENV === 'development') {
    app.set('showStackError', true);
    app.use(morgan('dev'));
  }

  app.enable('jsonp callback');

  // Should come before session (if used)
  app.use(cookieParser());

  // Request body parsing middleware should be above method-override
  // https://github.com/expressjs/body-parser#bodyparserurlencodedoptions
  // extended: true means use qs for parsing
  // https://www.npmjs.com/package/qs
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use(require('method-override')());

  // Routes should be last
  bootstrapRoutes(app);

  // Initializing routes from the server/routes directory
  function bootstrapRoutes(app) {
    var routesPath = path.join(appPath, 'server', 'routes');
    if (fs.existsSync(routesPath)) {
      var walk = function(routes_path) {
        fs.readdirSync(routes_path).forEach(function(file) {
          var newPath = routes_path + '/' + file;
          var stat = fs.statSync(newPath);
          if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
              require(newPath)(app);
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
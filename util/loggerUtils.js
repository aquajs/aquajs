var path = require('path'),
    AquaJsLogger= require('aquajs-logger');
    require(path.join('.','..','constants','GlobalConstants')); //for all the global constants

exports.initLogger= function(logpath) {

    var logJsonConfig = require(logpath);

    AquaJsLogger.init(logJsonConfig, $appId);

    //define the global logger object to be used through out application
    //also define the custom methods to be added to the global $logger

    $logger = AquaJsLogger.getLogger();
    $winston = AquaJsLogger.getWinston();
    $logger.infoDebug = infoDebug ; //inject the common method infoDebug for enabling debug and info both
    $logger.errorDebug = errorDebug ;
    var allLogConfig = require(logpath);
    if (allLogConfig.logConfig.precog) {
        AquaJsPrecog = require('aquajs-precog');
        this.initPrecogLgger($app, $config.app.logconfpath, AquaJsLogger.getWinston(), $logger);
    }

    //inject the loglevel  dynamically based on the query param example http://google.com?debug=true

    $app.use(function(req,res,next) {
        var prevConsoleLevel,prevFileLogLevel ;
        if(req.query.debug && req.query.debug==="true") {
            prevConsoleLevel =  $logger.transports.console.level;
            prevFileLogLevel =  $logger.transports.rollingFileAppender.level;
            $logger.transports.console.level = 'debug';
            $logger.transports.rollingFileAppender.level = 'debug';
            req.on("end", function() {
                $logger.transports.console.level = prevConsoleLevel;
                $logger.transports.rollingFileAppender.level = prevFileLogLevel;
            });
        }
        next();
    });

}

exports.initPrecogLgger= function(app, logpath, winston, logger) {
    var logJsonConfig = require(logpath);
    AquaJsPrecog.init(app, logJsonConfig, winston, logger);
}

//$logger is the global variable defined in bootstrap.js


function infoDebug (message) {
    $logger.debug(message);
    $logger.info(message);
};

function errorDebug (message) {
    $logger.debug(message);
    $logger.info(message);
};

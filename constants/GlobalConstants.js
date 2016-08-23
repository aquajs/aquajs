var fs = require('fs'),
    path = require('path'),
    dirPathLoc = process.env.DIR_EXPORTS_PATH ||  path.join(process.cwd(), 'config' ) ,
    dirFilePathLoc = path.join(dirPathLoc,'dirPaths.js');
     if (fs.existsSync(dirFilePathLoc) ) {
          GLOBAL.$dirPaths = require(dirFilePathLoc);
    };
GLOBAL.$config = {};
GLOBAL.$app = {};//Used in bootstrap and connUtils
GLOBAL.$logger = {} ;// instantiated in bootstrap and used across the application .= AquaJsLogger.getLogger();
GLOBAL.$winston = {};// instantiated in bootstrap= AquaJsLogger.getWinston();

//enableWaterline,enablePersist are used  in bootstrap and conn Utils
GLOBAL.$enableWaterline = false;
GLOBAL.$enablePersist = false;
GLOBAL.$appId = "[aquajs-logger]";

//$initModel ,$conn used in connUtils
GLOBAL.$initModel = false;
GLOBAL.$conn = {};


var path = require('path');

//$dirPaths,$config,$app are used in bootstrap
GLOBAL.$dirPaths = require(path.join(process.cwd(), 'config', 'dirPaths'));
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


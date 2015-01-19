var express = require('express'),
  Waterline = require('waterline'),
  fs = require('fs'),
  path = require('path'),
  async = require("async"),
  persist = require('persist');

GLOBAL.$loadModel = false;

var nodeUtilities = {

  checkConnection: function (adapter, method) {
    if ($loadModel) {
      if (adapter === "oracle") {
        $conn.runSqlAll("SELECT systimestamp FROM dual", [], function (err, result) {
          if (err) {
            console.log("Persist connection not available");
            //re-connecting persist
            if (enablePersist) {
              if (eachConfig["driver"] !== undefined) {
                persist.connect(eachConfig, function (err, conn) {
                  if (err) {
                    console.log("oracle connection could not be established");
                  }
                  GLOBAL.$conn = conn;
                  $loadModel = true;
                });
              }
            }

          }
        });
      }
    }

  },

  initORM: function (enableWaterline, enablePersist, dbConfList, app) {

    var eachModel, orm;
    async.each(dbConfList, function (eachConfig, callback) {
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

        if (orm === undefined) {
          if (eachModel.prototype !== undefined && eachModel.prototype.adapter !== undefined && enableWaterline) {
            orm = new Waterline();
            orm.loadCollection(eachModel);
          }

        }
        callback();
      }, function (err) {

        if (enableWaterline) {
          if (eachConfig["adapters"] !== undefined) {
            orm.initialize(eachConfig, function (err, models) {
              try {
                $app.models = models.collections;
                $app.connections = models.connections;
                $loadModel = true;
                $app.connections.mongo.config.auto_reconnect = true;
              } catch (e) {
                console.log("error: ensure mongo is running before starting microservice");
              }

            });
          }
        }
        if (enablePersist) {
          if (eachConfig["driver"] !== undefined) {
            persist.connect(eachConfig, function (err, conn) {
              if (err) {
                console.log("oracle connection could not be established");
              }
              GLOBAL.$conn = conn;
              $loadModel = true;
            });
          }
        }
      });

    }, function (err) {
      if (err) {
        AquaJsLogger.getLogger().error(err);
      }
    });
  }
};

module.exports = nodeUtilities;

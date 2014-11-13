'use strict';

/**
  * Created by verangasamy on 7/29/14.
  * Aqua JS Dependency injection
 * It finds all the modules from the node_modules folder  and exports it
 */

var dependable = require('dependable');
var container = dependable.container();
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();
var modules = [];
var path = require('path');
var app={};
//initialize all the global variables used in the microservices

function aqua() {
    if (this.active) return;
    this.events = events;
};

/**
 * makes the dependably injection by findind the node modules and enabling it
 * @api public
 * @param name
 * @param options
 * @see
 * @return
 */


aqua.prototype.app = function (name, options) {
    if (this.active) return this;
    findModules();
    enableModules();
  /*  // Initializing system variables
    var config = require( path.join(__dirname,'..','config','config')),
    // Bootstrap Models, Dependencies, Routes and the app as an express app
    app = require(path.join(__dirname,'..','config','system','bootstrap') )(config);*/
    this.active = true;
    return this;
}

function modulePath(name) {
    return nodeModulesDir + name;
}

aqua.prototype.status = function () {
    return {
        active: this.active,
        name: this.name
    };
};
/**
 * Find the modules from the node_modules folder
 * @api public
 * @see
 * @return
 */


function findModules() {
    fs.exists(process.cwd() + '/node_modules', function (exists) {
        if (exists) {
            fs.readdir(process.cwd() + '/node_modules', function (err, files) {
                if (err) console.log(err);
                if (!files) files = [];
                files.forEach(function (file, index) {
                    fs.readFile(process.cwd() + '/node_modules' + file + '/package.json', function (fileErr, data) {
                        if (err) throw fileErr;
                        if (data) {
                            //Add some protection here
                            var json = JSON.parse(data.toString());
                            if (json.mean) {
                                modules.push({
                                    name: json.name,
                                    version: json.version
                                });
                            }
                        }
                        if (files.length - 1 == index) events.emit('modulesFound');
                    });
                });
            });
        }
    })

}

/**
 * Enable the modules found found from the node_modules folder
 * @api public
 * @see
 * @return
 */

function enableModules() {
    events.on('modulesFound', function () {

        modules.forEach(function (module, index) {
            //add warnings
            require(process.cwd() + '/node_modules/' + module.name + '/app.js');
        });

        modules.forEach(function (module) {
            container.resolve.apply(this, [module.name]);
            container.get(module.name);
        });

        return modules;
    });

}
/**
 * Enable the modules found found from the utils folder
 * @api public
 * @see
 * @return
 */


function enableModulesFromUtils() {
    var serverPath =  process.cwd() + './../server/utils'
    var walk = function (models_path) {
        fs.readdirSync(models_path).forEach(function (file) {
            var newPath = models_path + '/' + file
            var stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        });
    };
    walk(serverPath);
}


var aqua = module.exports = new aqua;

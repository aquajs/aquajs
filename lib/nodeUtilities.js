var express = require('express'),
  Waterline = require('waterline'),
  persist = require('persist');


var nodeUtilities = {
  checkConnection : function(adapter){
    if(adapter === "oracle") {
      if(!$conn)
      {
        console.log("persist connection not available");
      }
    } else {
      if(!$app.connections)
      {
        console.log("waterline connection not available");
      }
    }


  }
};

module.exports = nodeUtilities;

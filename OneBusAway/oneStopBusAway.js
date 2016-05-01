/*
// OneStopBusAway

// class BusStop
    --> Stop Number (ID)
    --> Description
   
    Methods:
    
     
// class Bus
    --> Bus Number(ID)
    --> List<Stop>
  
// Application
getExpectedTimeToReachTheStop(Bus, BusStop){}
*/
var http = require("http");
var API_KEY = '2fe44be7-ba4a-4bc7-ae98-a9ead373a178';

var OneStopBusAwayApp = OneStopBusAwayApp | {};

// Application class
var OneBusAwayServiceAdapter = function() {
    this._method = 'GET';
    this._host = 'api.pugetsound.onebusaway.org';
    this._port = 80;
    this._pathURL = "";
    this._postData = {};
};

OneBusAwayServiceAdapter.prototype._constructOptions = function() {
  var options = {   
    host: this._host,
    port: this._port,
    path: this._pathURL,
    method: this._method,
    headers: {
        'Content-Type': 'application/javascript',
    }
  };
  return options;
};

OneBusAwayServiceAdapter.prototype.getStopInfo = function(stopId, callback) {
  var STOP_ID_PREFIX = '/api/where/schedule-for-stop/1_';
  this._pathURL = STOP_ID_PREFIX + stopId + '.json?key=' +  API_KEY;
  return this._call(callback);
};

OneBusAwayServiceAdapter.prototype._call = function(callback) {
    var options = this._constructOptions();
    return new Promise(function(resolve, reject) {
      try {  
        http.request(options, function(response) {
          var dataChunck = "";
        
          // Get response data in chunks
          response.on('data', function(data) {
            dataChunck += data;
          });

          // Once we have all the data from the request 
          // process the data 
          response.on('end', function() {
            parsedData = JSON.parse(dataChunck);            
                resolve(parsedData);
          });
        }).end();
      } catch(ex) {
        reject(ex);
      };
    });
};

// Route Class
var Route = function(id) {
    if (typeof id == 'undefined') {
        throw "Route object cannot be constructed as id is undefined";
    } else {
      this.id = id;           
    }
}

// Bus class
var Bus = function(id) {
    if (typeof id == 'undefined') {
        throw "Bus object cannot be constructed as id is undefined";  
    } else {
      this.id = id;
      this.routes = [];      
    }   
}

Bus.prototype.addRoute = function(route) {
  this.routes.push(route);
}

Bus.prototype.removeRoute = function(routeId) {
      var routeIndex = -1;
      for (var route in this.routes) {
        routeIndex++;
        if (route.id === routeId) {
          break;
        }
      }
      
      if (routeIndex > -1) {
          routes.splice(routeIndex, 1);  
      }
}

function getEstimatedTimeForTheStop(parsedData) {

  var currentTime = parsedData.currentTime;
  var stopTimes = parsedData.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].scheduleStopTimes;
  var scheduleTimes = [];
  for(var scheduleStopTimeIndex in stopTimes) {
      var arrivalTime = stopTimes[scheduleStopTimeIndex].arrivalTime;
      var timeDifference = arrivalTime - currentTime;
      if (timeDifference > 0) {
        scheduleTimes.push(Math.floor(timeDifference/60000));
      }
  }
  return scheduleTimes.sort(function(a, b){return a-b});
}

adapter = new OneBusAwayServiceAdapter();
adapter.getStopInfo(68406, getEstimatedTimeForTheStop).then(function(parsedData) {    
    scheduledTimes = getEstimatedTimeForTheStop(parsedData);
    if(scheduledTimes.length === 0) {      
      // null handling
      console.log('No Buses');
    } else {
      var nextBusTime = scheduledTimes[0];
      console.log("The next bus is in " + nextBusTime + " minutes");
    }
});

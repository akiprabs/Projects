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

/*
  Alexa Skill handler
*/
exports.handler = function (event, context) {
  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);
    GlobalContext = context;

    if (event.session.new) {
      onSessionStarted({requestId: event.request.requestId}, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
        context.succeed(buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "IntentRequest") {
        onIntent(event.request, event.session, finalCallBack);
    } else if (event.request.type === "SessionEndedRequest") {
        onSessionEnded(event.request, event.session);
        context.succeed();
    }
  } catch (e) {
        context.fail("Exception: " + e);
  }

  function finalCallBack(sessionAttributes, speechletResponse) {
      console.log("I am already exitting")
      GlobalContext.succeed(buildResponse(sessionAttributes, speechletResponse));
  }

  /**
   * Called when the session starts.
   */
  function onSessionStarted(sessionStartedRequest, session) {
      console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
          ", sessionId=" + session.sessionId);
  }

  /**
   * Called when the user launches the skill without specifying what they want.
   */
  function onLaunch(launchRequest, session, callback) {
      console.log("onLaunch requestId=" + launchRequest.requestId +
          ", sessionId=" + session.sessionId);

      // Dispatch to your skill's launch.
      getWelcomeResponse(callback);
  }

  /**
   * Called when the user specifies an intent for this skill.
   */
  function onIntent(intentRequest, session, callback, sessionAttributes, speechletResponse) {
      console.log("onIntent requestId=" + intentRequest.requestId +
          ", sessionId=" + session.sessionId);

      var intent = intentRequest.intent,
          intentName = intentRequest.intent.name;

      // Dispatch to your skill's intent handlers
      if ("AMAZON.StopIntent" === intentName) {
          exit(intent, session, callback, sessionAttributes, speechletResponse);
      } else if ("busTime" === intentName) {
          main(intent, session, callback, sessionAttributes, speechletResponse, true);
      } else {
          throw "Invalid intent";
      }
  }

  function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Hello Akshay, give me the instructions";
    var shouldEndSession = false;

    finalCallBack(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
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

  function main(intent, session, callback, sessionAttributes, speechletResponse, stopId) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    adapter = new OneBusAwayServiceAdapter();
    adapter.getStopInfo(68406, getEstimatedTimeForTheStop).then(function(parsedData) {    
        scheduledTimes = getEstimatedTimeForTheStop(parsedData);
        if(scheduledTimes.length === 0) {      
          // null handling
          speechOutput = "There are no Buses";
        } else {
          var nextBusTime = scheduledTimes[0];
          speechOutput = "The next bus is in " + nextBusTime + " minutes";
        }
        finalCallBack(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
  }

  // --------------- Helpers that build all of the responses -----------------------
  function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
      return {
          outputSpeech: {
              type: "PlainText",
              text: output
          },
          card: {
              type: "Simple",
              title: "SessionSpeechlet - " + title,
              content: "SessionSpeechlet - " + output
          },
          reprompt: {
              outputSpeech: {
                  type: "PlainText",
                  text: repromptText
              }
          },
          shouldEndSession: shouldEndSession
      };
  }

  function buildResponse(sessionAttributes, speechletResponse) {
      return {
          version: "1.0",
          sessionAttributes: sessionAttributes,
          response: speechletResponse
      };
  }
}



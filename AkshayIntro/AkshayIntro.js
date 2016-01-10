/**
 * Author: Akshay
 */

var http = require("http");
var apiKey ="2fe44be7-ba4a-4bc7-ae98-a9ead373a178";

exports.handler = function (event, context) {
	try {
		console.log("event.session.application.applicationId=" + event.session.application.applicationId);
		
		
		if (event.session.new) {
			onSessionStarted({requestId: event.request.requestId}, event.session);
		}
		
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session, 
                function callback() {
            		context.succeed(buildResponse(sessionAttributes, speechletResponse));
            	});
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
		
	}  catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the Skill launches itself
 */
function onLaunch(launchRequest, seesion, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
            ", sessionId=" + session.sessionId);
}

/**
 * Called when some intent was passed on to Alexa
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
            ", sessionId=" + session.sessionId); 
    
    var intent = intentRequest.intent,
    intentName = intentRequest.intent.name;
    
    switch(intentName) {
    case "hobbies" : {
    	hobbyIntent(intent, session, callback);
    	break;}
    case "currentProject"		: {
    	currentIntent(intent, session, callback);
    	break;}
    case "jobDescription"   	: {
    	jobDescriptionIntent(intent, session, callback);
    	break;}
    case "AMAZON.StopIntent"	: {
    	stopIntent(intent, session, callback)
    	break;}
    default: {
    	helpIntent(intent, session, callback);
    }
    }
}

function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
} 

//--------------- Functions that control the skill's behavior -----------------------
function hobbyIntent(intent, session, callback) {
	var sessionAttributes = {};
	var cardTitle = intent.name;
	var repromptText = null;
	var shouldEndSession = false;
	
	var speechOutput = "Hmmmm, May be reading. I would advice better ask him.";
	
	callback(sessionAttributes, 
			buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	
}

function currentIntent(intent, session, callback) {
	
	var cardTitle = intent.name;
	var repromptText = null;
	var shouldEndSession = false;
	var sessionAttributes = {};
	var speechOutput = "He seems to be working on an interesting project, which is me.";
	
	callback(sessionAttributes,
	         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    
}

function jobDescriptionIntent(intent, session, callback) {
	var cardTitle = intent.name;
	var repromptText = null;
	var shouldEndSession = false;
	var sessionAttributes = {};
	
	var speechOutput = "He has been working with video advertising team in Amazon. " +
			"And the last time I had heard from him was, that he is having fun there.";
	
	callback(sessionAttributes,
	         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    
}

function helpIntent(intent, session, callback) {
	var cardTitle = intent.name;
	var repromptText = null;
	var shouldEndSession = false;
	var sessionAttributes = {};
	var speechOutput = "I was not able to understand, can you repeat that?";
	
	callback(sessionAttributes,
	         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function stopIntent(intent, session, callback) {
	var cardTitle = intent.name;
	var repromptText = null;
	var sessionAttributes = {};
	var shouldEndSession = true;
	
	var speechOutput = "Ok. Was nice talking to you, Have a good day.";
	
	callback(sessionAttributes,
	         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
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

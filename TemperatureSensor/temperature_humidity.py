#!/usr/bin/python
import sys
import Adafruit_DHT

# Web utilities
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json

PORT_NUMBER = 8000;

def convertCelsiusToFahrenheit(tempInCelc):
    tempInF = tempInCelc * 9;
    tempInF = tempInF / 5;
    return tempInF + 32



def constructTemperatureResponse(temperature):
    temperatureResponse = {}
    tempInC = temperature[1];
    temperatureResponse["celsius"] = tempInC
    temperatureResponse["fahrenheit"] = convertCelsiusToFahrenheit(tempInC)
    return temperatureResponse

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/temperature":
            temperature = Adafruit_DHT.read_retry(11, 4)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(constructTemperatureResponse(temperature)))
        else :
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({}))

# Start up a python server
try:
    server = HTTPServer(('', PORT_NUMBER), RequestHandler)
    print 'Started httpserver on port ', PORT_NUMBER
    server.serve_forever()
except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()

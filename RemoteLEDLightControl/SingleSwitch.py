import RPi.GPIO as GPIO
import time
import urlparse
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

# Details about the GPIO pins
# http://pinout.xyz/pinout/pin2_5v_power

GPIO.setmode(GPIO.BCM)

allPorts = [23]
PORT_NUMBER = 8000

# Setup all the ports as output
# By default all the ports will be on
def setUpAllPorts():
    for port in allPorts:
        GPIO.setup(port, GPIO.OUT)

#For now Turn on/Off all the setup ports based on the intent
def toggle(turnOff):
    for port in allPorts:
        if turnOff is not None:
            print "turnToggle : " + str(turnOff)
            if turnOff:
                GPIO.output(port, 0)
            else:
                GPIO.output(port, 1)
        else:
            GPIO.output(port, 1)

# Main function
class myHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlparse.urlparse(self.path).query
        if query:
            selectedIntent = urlparse.parse_qs(query)['toggle']
            toggleIntent = int(selectedIntent[0])
            print "toggleIntent" + str(toggleIntent)
            toggle(toggleIntent)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write("Congratulations!!!")
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write("Your response failed!!!")
        # Send the html message
        return

try:
    server = HTTPServer(('', PORT_NUMBER), myHandler)
    print 'Started httpserver on port ', PORT_NUMBER
    setUpAllPorts()
    server.serve_forever()
except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()
    GPIO.cleanup()

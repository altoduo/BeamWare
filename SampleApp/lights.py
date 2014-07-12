"""
BeamWare Sample Client Application
"""

#import RPi.GPIO as gp
import BeamLibrary


class Lights(object):

    def __init__(self):
        #gp.setwarnings(False)
        #gp.setmode(gp.BOARD)
        #gp.setup(7, gp.OUT)
        #gp.setup(11, gp.OUT)
        #gp.setup(13, gp.OUT)
        #gp.setup(15, gp.OUT)
        #gp.output(7, True)
        #gp.output(11, True)
        print "INITED"

    def clockwise(self):
        #gp.output(13, True)
        #gp.output(15, False)
        print "YAY"

    def counterclockwise(self):
        gp.output(13, False)
        gp.output(15, True)


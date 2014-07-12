#import RPi.GPIO as gp
import BeamLibrary

#gp.setwarnings(False)
#gp.setmode(gp.BOARD)
#gp.setup(7, gp.OUT)
#gp.setup(11, gp.OUT)
#gp.setup(13, gp.OUT)
#gp.setup(15, gp.OUT)
#
#gp.output(7, True)
#gp.output(11, True)
#

def clockwise():
    gp.output(13, True)
    gp.output(15, False)

def counterclockwise():
    gp.output(13, False)
    gp.output(15, True)

BeamLibrary.lol()

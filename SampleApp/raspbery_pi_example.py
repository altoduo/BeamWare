"""
BeamWare Sample Raspberry Pi GPIO Application
"""

import subprocess
import RPi.GPIO as gp
import time

from beamlibrary import BeamLibrary

class MyApp(object):

    def __init__(self):
        gp.setwarnings(False)
        gp.setmode(gp.BOARD)
        gp.setup(7, gp.OUT)
        gp.setup(11, gp.OUT)
        gp.setup(13, gp.OUT)
        gp.setup(15, gp.OUT)

        gp.output(7, True)
        gp.output(11, True)


    def on(self):
        gp.output(13, False)
        gp.output(15, True)

    def off(self):
        gp.output(13, False)
        gp.output(15, False)

    def strobe(self):
        i = 0
        while i < 10:
            time.sleep(0.1)
            self.on()
            time.sleep(0.1)
            self.off()
            i += 1

b = BeamLibrary.BeamLib(MyApp, '192.168.1.110')

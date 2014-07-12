"""
BeamWare Sample Client Application
"""

import subprocess
import BeamLibrary


class MyApp(object):

    def __init__(self):
        print "Initialize MyApp"

    def addr(self, x):
        return x+1

    def ls(self):
        return subprocess.check_output(["ls", "-1"])

    def dumb(self):
        return "Ur dum"

    def complex(self, a, b, c, x=1, y=2, z=3):
        return "hello ;ol"

    def hey(self, some_string):
        print "HEY Got called! Woo!"
        return "Hey there %s" % (some_string)

b = BeamLibrary.BeamLib(MyApp)

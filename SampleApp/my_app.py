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

    def simple(self):
        return "This is a simple text output"

    def complex(self, a, b, c, x=1, y=2, z=3):
        return a + b + c + x + y + z

    def str_example(self, some_string):
        print "Running the String Example str_example"
        return "String Example! Here's your input: %s" % (some_string)

b = BeamLibrary.BeamLib(MyApp)

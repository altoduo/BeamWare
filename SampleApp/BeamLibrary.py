"""
BeamWare Library for the Client Application
"""

import zerorpc

class BeamLib(object):

    def __init__(self, client_app_class, port = 4242):
        self.app = client_app_class
        self.port = port
        #TODO: Add class checking, throw exception otherwise
        self.server = zerorpc.Server(self.app())
        self.server.bind("tcp://0.0.0.0:%d" % (self.port))

    def run():
        self.server.run()

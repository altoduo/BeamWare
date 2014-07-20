"""
BeamWare Library for the Client Application
"""

from time import sleep
from types import MethodType
import inspect
import json
import os
import requests
import socket
import subprocess


from rpc import BW_functions, BW_class_name
from zerorpcpython import zerorpc

class BeamLib(object):

    def __init__(self, client_app_class, node_server_ip= '127.0.0.1', port = 4242):
        #TODO: Add class checking, throw exception otherwise
        self.port = port
        self.node_server_ip = node_server_ip
        self.app = client_app_class
        self.app_name = ""
        self.func_json = {}
        self._derobe(client_app_class)
        self.func_json = json.dumps(self.func_json)
        self._init_meta_functions()
        self._init_server(port)
        self._handshake()
        self._run()

    def _handshake(self):
        """
        Handshake with the BeamWare Node server and
        send a list of functions and ip address
        """
        local_ip = self._get_local_ip()
        tcp = 'tcp://' + local_ip + ':' + str(self.port)
        http = 'http://' + self.node_server_ip + ':3000/rpc/registration'
        data = {'name': str(self.app_name), 'url': str(tcp)}
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        r = requests.post(http, data=json.dumps(data), headers=headers)

    def _init_meta_functions(self):
        """
        Adds meta functions to client class for RPC
        Clean this up and automate!
        """
        self.app.func_json = self.func_json
        self.app.app_name = self.app_name
        self.app.BW_functions = MethodType(BW_functions,self.app)
        self.app.BW_class_name = MethodType(BW_class_name, self.app)

    def _init_server(self, port):
        """
        Test for valid class and initialize RPC server
        """
        try:
            is_class = inspect.isclass(self.app)
        except NameError as e:
            raise e
        print "Binding server to port %d..." % (port)
        self.server = zerorpc.Server(self.app())
        self.server.bind("tcp://0.0.0.0:%d" % (port))

    def _derobe(self, app, base=False):
        """
        Undress a client class and reveal it's methods
        @base toggles showing base methods such as __init__
        Return a json object of {func: args}
        """
        core_methods = ['__module__', '__dict__', '__doc__', '__weakref__',
                        '__init__']
        bare_client_class = app.__new__(app)
        self.app_name = bare_client_class.__class__.__name__
        if base:
            func_lst = [function for function in dir(app)]
        else:
            func_lst = [function for function in app.__dict__]
        if not func_lst:
            raise NotImplementedError("No methods in %s" % (self.app_name))
        for func in func_lst:
            if func in core_methods:
                continue
            ref_func = getattr(app, str(func))
            if not inspect.ismethod(ref_func):
                raise TypeError("%s is not a method!" % (func))
            else:
                argspec = inspect.getargspec(ref_func)
                args = argspec[0]
                args.remove('self')  # Why no 1 line?
                defaults = {}
                if argspec[3]:
                    i = -1
                    for val in argspec[3]:
                        defaults[str(args[i])] = str(val)
                        i -= 1
                self.func_json[func] = {
                                        "args": args,
                                        "defaults": defaults
                                        }

    def _run(self):
        print "RPC Server Started..."
        self.server.run()

    def _get_local_ip(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('google.com', 0))
        return s.getsockname()[0]

    def get_source(self, function):
        """
        Returns source code for function
        """
        return inspect.getsource(function)

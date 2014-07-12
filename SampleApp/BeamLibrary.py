"""
BeamWare Library for the Client Application
"""

import zerorpc
import json
import inspect

from rpc import _functions, _class_name

class BeamLib(object):

    def __init__(self, client_app_class, port = 4242):
        self.app = client_app_class
        #TODO: Add class checking, throw exception otherwise
        self._init_server(client_app_class, port)
        self.app_name = ""
        self.func_json = {}
        self._derobe(client_app_class)
        self._run()

    def _init_server(self, app, port):
        """
        Test for valid class and initialize RPC server
        """
        try:
            is_class = inspect.isclass(app)
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
        self.server.run()

    def get_source(self, function):
        """
        Returns source code for function
        """
        return inspect.getsource(function)

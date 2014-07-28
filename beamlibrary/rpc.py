"""
BeamWare RPC Server Functions
"""

def _functions(self):
    return self.func_json

def _class_name(self):
    return self.app_name

def _ping(self):
    return "pong"

def _refresh(self):
    self._deregister(self)
    reload(self.app)
    self._init_app_meta_functions(self)
    self._derobe(self.app)
    self._init_meta_functions()
    self._init_server(self.port)
    self._handshake()
    self._run()


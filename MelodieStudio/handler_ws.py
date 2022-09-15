import subprocess
import json
import os
import select
import time
from typing import Any, Dict, List, Union
import queue
from flask import Flask
from flask_sock import Sock
from pytest import console_main
from .models import WSMessage, WSToServerMessage
import threading
import platform
from .utils.ptyhandler import MelodiePTY
from .utils.machine import is_windows
if platform.system().lower().find('windows') != -1:
    from winpty import PtyProcess, PTY
else:
    import pty


class WSManager:
    def __init__(self) -> None:
        self.websockets = {}

    def add(self, ws):
        self.websockets[id(ws)] = ws

    def remove(self, ws):
        self.websockets.pop(id(ws))

# Responsibility chain pattern.


class WSHandlerCell:
    def __init__(self) -> None:
        self.type: str = None
        self._next_cell: WSHandlerCell = None

    def handle(self, msg: WSToServerMessage):
        raise NotImplementedError

    def set_next_cell(self, next_cell: "WSHandlerCell"):
        self._next_cell = next_cell

    def handle_in_chain(self, msg: Dict[str, Any]):
        if msg['type'] == self.type:
            self.handle(msg['payload'])
        else:
            if self._next_cell is not None:
                self._next_cell.handle()
            else:
                raise NotImplementedError("Nextcell was none!")


class PTYHandleCell(WSHandlerCell):
    def __init__(self) -> None:
        super().__init__()
        self.type = "pty-input"
        self.shell = "cmd" if is_windows() else os.environ.get('SHELL', 'sh')
        self.ptys: Dict[str, MelodiePTY] = {}

    def handle(self, msg: Dict[str, Any]):
        cmd = msg['cmd']
        termID = msg['termID']
        msg_type = msg['msgType']
        assert msg_type in {'new-pty', 'close-pty', 'cmd-pty'}
        if not termID in self.ptys:
            self.ptys[termID] = MelodiePTY(termID, self.shell, send_pty_output)
        else:
            self.ptys[termID].write(cmd)


def send_loop():
    while 1:
        # 如果有若干个相邻的包，就将包全部发送到前端。
        # 这是因为发送包本身有开销，这样可以减少发送包本身的开销。
        values = [send_queue.get()]
        assert isinstance(values[0], WSMessage)

        while not send_queue.empty():
            value = send_queue.get()
            values.append(value)
            assert isinstance(value, WSMessage), value

        ws_keys = list(ws_mgr.websockets.keys())
        for ws_key in ws_keys:
            ws = ws_mgr.websockets[ws_key]
            if ws.connected:
                ws.send(json.dumps([ws_msg.to_dict() for ws_msg in values]))
                print(f"send at {time.time()}", values[0].payload)
            else:
                ws_mgr.remove(ws)


ws_handlers = PTYHandleCell()


def register_websocket_handlers(app: Flask):

    global sock  # 设置成global才可。
    app.config["SOCK_SERVER_OPTIONS"] = {"ping_interval": 25}
    sock = Sock(app)

    @sock.route("/api/websocket")
    def echo(ws):
        """
        # The ws object has the following methods:
        # - ws.send(data)
        # - ws.receive(timeout=None)
        # - ws.close(reason=None, message=None)
        """
        ws_mgr.add(ws)
        while True:
            data = ws.receive()
            ws_handlers.handle_in_chain(json.loads(data))


def send_pty_output(term_id: str, content: str):
    send_queue.put(
        WSMessage("pty-output", {'output': content, 'termID': term_id})
    )


def send_subprocess_output(type: str, content: str):
    assert type in {"stderr", "stdout"}, "Invalid type" + type
    send_queue.put(
        WSMessage("subprocess-output",
                  {"type": type, "content": content}))


sock = None

send_queue: "queue.Queue[WSMessage]" = queue.Queue(1024)
ws_mgr = WSManager()
send_th = threading.Thread(target=send_loop)
send_th.setDaemon(True)
send_th.start()

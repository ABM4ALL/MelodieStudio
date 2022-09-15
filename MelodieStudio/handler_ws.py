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
        self.shell = os.environ.get('SHELL', 'sh')
        self.child_pids: Dict[str, int] = {}
        self.child_fds: Dict[str, int] = {}
        self.bg_threads: Dict[str, threading.Thread] = {}

    def new_pty(self, termID: str):

        def read_and_forward_pty_output(fd):
            max_read_bytes = 1024 * 20
            while True:
                time.sleep(0.01)
                timeout_sec = 0
                (data_ready, _, _) = select.select([fd], [], [], timeout_sec)
                if data_ready:
                    output = os.read(fd, max_read_bytes).decode()
                    # if output != "":
                    print('send-output', time.time(), termID, output)
                    send_pty_output(termID, output)

        child_pid, fd = pty.fork()
        if child_pid == 0:
            subprocess.run("bash")
        else:
            self.child_fds[termID] = fd
            self.child_pids[termID] = child_pid
            self.bg_threads[termID] = threading.Thread(
                target=read_and_forward_pty_output, args=(fd,))
            self.bg_threads[termID].setDaemon(True)
            self.bg_threads[termID].start()

    def handle(self, msg: Dict[str, Any]):
        cmd = msg['cmd']
        termID = msg['termID']
        if not termID in self.child_fds:
            self.new_pty(termID)
        os.write(self.child_fds[termID], cmd.encode())
        print(cmd, termID, cmd.encode("utf8"))


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

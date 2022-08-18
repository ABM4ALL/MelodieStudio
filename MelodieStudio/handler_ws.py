import json
from typing import Dict, List, Union
import queue
from flask import Flask
from flask_sock import Sock
from .models import WSMessage
import threading


class WSManager:
    def __init__(self) -> None:
        self.websockets = {}

    def add(self, ws):
        self.websockets[id(ws)] = ws

    def remove(self, ws):
        self.websockets.pop(id(ws))


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
                print("send", values[0].payload)
            else:
                ws_mgr.remove(ws)


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
            print("received_data")
            send_queue.put(WSMessage("message", data))


def send_subprocess_output(type: str, content: str):
    assert type in {"stderr", "stdout"}, "Invalid type" + type
    send_queue.put(WSMessage("subprocess-output",
                   {"type": type, "content": content}))


sock = None

send_queue: "queue.Queue[WSMessage]" = queue.Queue(1024)
ws_mgr = WSManager()
send_th = threading.Thread(target=send_loop)
send_th.setDaemon(True)
send_th.start()

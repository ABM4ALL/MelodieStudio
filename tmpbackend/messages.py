import json
from os import error, stat
from typing import Any


class Response:
    OK = 0
    ERROR = 1

    @staticmethod
    def _create_response(status: int, message: str, data: Any) -> str:
        assert status in {Response.OK, Response.ERROR}
        return json.dumps({"status": status,
                           "msg": message,
                           "data": data})

    @staticmethod
    def ok(data: Any) -> str:
        return Response._create_response(Response.OK, "", data)

    @staticmethod
    def error(msg: str) -> str:
        return Response._create_response(Response.OK, msg, None)

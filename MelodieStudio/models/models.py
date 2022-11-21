import json
from enum import Enum
from dataclasses import dataclass
from typing import Any, Union, List, TYPE_CHECKING
from py_ts_interfaces import Interface


class WSMessageTypes(str, Enum):
    SUBPROCESS_OUTPUT = "subprocess-output"
    PLOT = "plot"
    MESSAGE = "message"
    PTY_OUTPUT = "pty-output"
    FS_EVENT = "fs-event"
    PTY_STATUS_CHANGE = "pty-status-change"


if TYPE_CHECKING:
    import typing

    class WSMessageDict(typing.TypedDict):
        type: WSMessageTypes
        payload: Any


@dataclass
class WSMessage(Interface):
    type: WSMessageTypes
    payload: Union[Any, List]

    def __post_init__(self) -> None:
        assert self.type in WSMessageTypes

    def dump(self) -> str:
        return json.dumps(self.to_dict())

    def to_dict(self) -> "WSMessageDict":
        return {"type": self.type, "payload": self.payload}


@dataclass
class WSToServerMessage(Interface):
    type: WSMessageTypes
    payload: Any

    def __post_init__(self) -> None:
        assert self.type in {"command"}

    def dump(self) -> str:
        return json.dumps(self.to_dict())

    def to_dict(self) -> "WSMessageDict":
        return {"type": self.type, "payload": self.payload}

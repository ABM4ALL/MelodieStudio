from ast import List
from dataclasses import dataclass
import json
from typing import Any, Dict, Union
from py_ts_interfaces import Interface


@dataclass
class WSMessage(Interface):
    type: str
    payload: Union[Any, List]

    def __post_init__(self) -> None:
        assert self.type in {"subprocess-output", "plot", "message"}

    def dump(self) -> str:
        return json.dumps(self.to_dict())

    def to_dict(self) -> str:
        return {"type": self.type, "payload": self.payload}


@dataclass
class WSToServerMessage(Interface):
    type: str
    payload: Any
    def __post_init__(self) -> None:
        assert self.type in {"command"}

    def dump(self) -> str:
        return json.dumps(self.to_dict())

    def to_dict(self) -> str:
        return {"type": self.type, 'payload': self.payload}

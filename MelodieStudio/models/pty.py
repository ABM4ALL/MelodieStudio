from typing import TypedDict


class PTYMetaDict(TypedDict):
    id: str
    name: str
    command: str
    closed: bool

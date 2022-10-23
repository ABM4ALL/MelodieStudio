import json
from MelodieStudio.manipulators.base import BaseManipulator


class NetworkManipulator(BaseManipulator):
    def __init__(self, filename: str) -> None:
        super().__init__(filename)
        self.suffix = ("gexf",)
        assert filename.endswith(self.suffix)

    def read_gexf_file(self):
        with open(self.filename, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    def write_gexf_file(self, gexf_str: str):
        with open(self.filename, "w", encoding="utf-8", errors="replace") as f:
            f.write(gexf_str)

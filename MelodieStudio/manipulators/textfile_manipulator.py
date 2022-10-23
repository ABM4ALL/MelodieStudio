from .base import BaseManipulator


class TextfileManipulator(BaseManipulator):
    def __init__(self, filename: str):
        super().__init__(filename)

    def search(self, target: str, match_case=False, regex=False):
        assert (
            match_case == False and regex == False
        ), "Not implemented case matching or regex matching"
        results = []
        length = len(target)
        with open(self.filename, encoding="utf8", errors="replace") as f:
            row = 1
            while True:
                # Get next line from file
                line = f.readline()
                pos = line.find(target)
                if pos != -1:
                    results.append(
                        {"row": row, "col": (pos, pos + length), "lineText": line}
                    )
                if not line:
                    break
                row += 1
        return results

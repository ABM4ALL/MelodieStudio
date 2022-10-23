import jedi
import time

from jedi.inference.gradual.stub_value import StubFilter, ParserTreeFilter


def _is_name_reachable(self, name):
    if not ParserTreeFilter._is_name_reachable(self, name):
        return False

    # Imports in stub files are only public if they have an "as"
    # export.
    definition = name.get_definition()
    if definition is None:
        return False
    if definition.type in ("import_from", "import_name"):
        if name.parent.type not in ("import_as_name", "dotted_as_name"):
            return False
    n = name.value
    # TODO rewrite direct return
    if n.startswith("_") and not (n.startswith("__") and n.endswith("__")):
        return False
    return True


StubFilter._is_name_reachable = _is_name_reachable


def handle_autocomp(code, pos, file: str):
    t0 = time.time()
    script = jedi.Script(code, path=file)
    splitted = code[:pos].split("\n")
    line, col = len(splitted), len(splitted[-1])
    try:
        completions = script.complete(line, col)
        t1 = time.time()
        print(t1 - t0, completions[0])
        return [
            {"label": completion.name, "type": completion.type, "boost": 10000}
            for completion in completions
        ]
    except Exception as e:
        import traceback

        traceback.print_exc()
        return []


def handle_hint(code, pos, file: str):
    t0 = time.time()
    script = jedi.Script(code, path=file)
    splitted = code[:pos].split("\n")
    line, col = len(splitted), len(splitted[-1])
    try:
        completions = script.infer(line, col)
        t1 = time.time()
        print(t1 - t0, completions)
        return [
            {
                "fullName": completion.full_name,
                "description": completion.description,
                "docs": completion.docstring(),
                "boost": 10000,
            }
            for completion in completions
        ]
    except Exception as e:
        import traceback

        traceback.print_exc()
        return []

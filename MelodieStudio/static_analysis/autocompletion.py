import jedi
import time


def handle_autocomp(code, pos, file: str):
    t0 = time.time()
    script = jedi.Script(code, path=file)
    splitted = code[:pos].split("\n")
    line, col = len(splitted), len(splitted[-1])
    try:
        completions = script.complete(line, col)
        t1 = time.time()
        print(t1-t0)
        return [{"label": completion.name, 'boost': 10000}for completion in completions]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []

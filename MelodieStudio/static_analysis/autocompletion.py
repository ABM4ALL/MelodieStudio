import jedi
import time


def handle_autocomp(code, pos):
    t0 = time.time()
    script = jedi.Script(code, path='/Users/hzy/Documents/Projects/MelodieABM/melodie-demo/source/data_loader.py')
    splitted = code[:pos].split("\n")
    line, col = len(splitted), len(splitted[-1])
    completions = script.complete(line, col)
    t1 = time.time()
    print(t1-t0)
    return [{"label": completion.name, 'boost': 10000}for completion in completions]

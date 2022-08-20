from time import process_time_ns, time
import jedi, time

t0 = time.time()
code = '''
class A:
    def __init__(self):
        self.a = 12345
        self.a.
        pass
        '''
script = jedi.Script(code, path='example.py')
completions = script.complete(5, 15)
print([completion.name for completion in completions])
t1 = time.time()
print(t1-t0)
print(completions[0].__dict__.keys(), completions[0]._inference_state.__dict__.keys())
print(list(completions[0]._stack)[0].dfa)

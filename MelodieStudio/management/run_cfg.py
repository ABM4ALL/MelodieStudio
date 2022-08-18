import ast
import sys

sys.path.append("/Users/hzy/Documents/Projects/MelodieABM/Melodie")
from MelodieStudio.management.pycfg import get_function_cfg

f = """
def f():
    a = 123
    b = 455
    if a>0:
        while 1:
            a+=1
            if a>1000:
                break
"""

cfg = get_function_cfg(ast.parse(f))
print(cfg)
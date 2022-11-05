import parso
module = parso.parse("""
from Melodie import Agent

class A(Agent):
    def setup(self):
        self.a = 123123
        self.b = 123123

    def find_agent(self):
        pass

""", version="3.9")
print(module.children[1])
print(module.children[1].children)
print(module.children[1].children[6].children[1].children)
classes = list(module.iter_classdefs())
print(dir(classes[0]))
print(list(module.iter_classdefs())[0].name)
print(list(module.iter_classdefs())[0].type)

print(list(classes[0].iter_funcdefs()))


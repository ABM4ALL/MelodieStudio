from pycparser.c_ast import *
from typing import Dict, Optional
import textwrap


class BaseNode:
    next: Optional["BaseNode"]

    def __init__(self) -> None:
        self.id = ""
        self.inputs: Dict[str, str] = {}
        self.outputs: Dict[str, str] = {}
        # self._valid_inputs

    def generate_c(self, level: int):
        return ""


class ConditionNode(BaseNode):
    on_true: Optional[BaseNode]
    on_false: Optional[BaseNode]

    def __init__(self) -> None:
        super().__init__()
        self.condition_phrase = ("", "", "")
        self.on_true = None
        self.on_false = None
        # self.inputs = {"in": }

    def generate_c(self, level: int):
        code = textwrap.dedent("""
        if(%s){
        %s
        }else{
        %s
        }
        """) % ("".join(self.condition_phrase), self.on_true.generate_c(1), self.on_false.generate_c(1))
        return textwrap.indent(code, " "*4*level)


class DoForSeveralTimes(BaseNode):
    def __init__(self) -> None:
        super().__init__()
        self.loop_times = "NUM"
        self.body = None
        self.next = None

    def generate_c(self, level: int):
        code = textwrap.dedent("""
        for(int i=0; i<%s; i++){
        %s
        }
        %s
        """) % (self.loop_times, self.body.generate_c(1), self.next.generate_c(0))
        return textwrap.indent(code, " "*4*level)


class ActionNode(BaseNode):
    def __init__(self) -> None:
        super().__init__()
        self.action_name = ""
        self.next = None

    def generate_c(self, level: int):
        code = ("""%s(a);\n""" % (self.action_name))+self.next.generate_c(0)
        code = textwrap.dedent(code)
        return textwrap.indent(code, " "*4*level)


class StartNode(BaseNode):
    def __init__(self) -> None:
        super().__init__()
        self.next = None

    def generate_c(self, level: int):
        return self.next.generate_c(level)


class EndNode(BaseNode):
    def __init__(self) -> None:
        super().__init__()

    def generate_c(self, level: int):
        return textwrap.indent("goto END;\n", " "*4*level)


start = StartNode()
cn = ConditionNode()
cn.condition_phrase = ("a.a", ">", "0")
cond_a_le_0 = ConditionNode()
cond_a_le_0.condition_phrase = ("a.b", "<=", "0")
ac = ActionNode()
end = EndNode()
ac.action_name = "increase_a"

start.next = cn
cn.on_false = cond_a_le_0
cn.on_true = ac


loop = DoForSeveralTimes()
loop.body = end
loop.next = end
cond_a_le_0.on_true = loop

cond_a_le_0.on_false = end
ac.next = end

print(start.generate_c(1))
# print(c_formatter_42.run.run_all(start.generate_c()))
# pycparser.parse_file
# parser = pycparser.CParser()
# c_ast = parser.parse("""
# typedef struct a{
#     int a;
# }Agent;
# void increase_a(Agent* a){
#     a.a+=1;
#     return;
# }
# """)
# # c_ast.show()

# c_ast2: FileAST = parser.parse("""
# int myfunc(){

#     return 0;
# }
# """)
# ret = c_ast2.show()
# # print(c_ast2)
# myfunc_ast: FuncDef = c_ast2.ext[0]
# func_body: Compound = myfunc_ast.body

# current_node = start
# walked_node = set(id(start))

# while len(walked_node) < 4:
#     if current_node.next > 0:
#         pass

# func_body.block_items.append()

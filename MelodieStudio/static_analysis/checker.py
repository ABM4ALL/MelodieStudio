from enum import Enum
from lib2to3.pytree import Leaf
from optparse import Option

import parso
from parso.python import tree
from parso.tree import Leaf, BaseNode
from typing import Optional, cast


class ComponentTypes(Enum):
    Agent = 'Agent'
    Environment = 'Environment'
    Scenario = 'Scenario'


def find_class(name: str, file: str) -> tree.Class:
    with open(file, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
        module = parso.parse(content)
        classdef: tree.Class
        for classdef in module.iter_classdefs():
            class_name: tree.Name = cast(tree.Name, classdef.name)

            if class_name.value == name:
                return classdef
    raise ValueError(f"class {name} not found in file {file}!")


class ParsoTreeVisitor:
    @staticmethod
    def visittype_simple_stmt(node: tree.PythonNode):
        print('simple_stmt_visited', node)

    @staticmethod
    def visitcls_ExprStmt(node:tree.ExprStmt):
        print('exprstmt', node, [ name.get_previous_sibling() for name in node.get_defined_names()])

    @staticmethod
    def visit(node: BaseNode):
        for child in node.children:

            cls_name = child.__class__.__name__
            if hasattr(ParsoTreeVisitor, 'visittype_'+child.type):
                getattr(ParsoTreeVisitor, 'visittype_'+child.type)(child)
            elif hasattr(ParsoTreeVisitor, 'visitcls_'+cls_name):
                getattr(ParsoTreeVisitor, 'visitcls_'+cls_name)(child)
            if isinstance(child, Leaf):
                continue
            else:
                assert isinstance(child, BaseNode), child
                ParsoTreeVisitor.visit(child)


class ComponentMeta:
    """
    Meta of user defined component. All data are generated statically by parso.

    """

    def __init__(self, name: str, file: str):
        self.name = name
        self.file = file
        # self.type: ComponentTypes = type
        self._scan_component()

    def _scan_component(self):
        cls_ = find_class(self.name, self.file)
        func_def: tree.Function
        for func_def in cls_.iter_funcdefs():
            print(func_def.children)
            print(func_def.dump())
            ParsoTreeVisitor.visit(func_def)
            # print((func_def.get_suite()))

from ast import *

import typing

import astunparse

_id = -1


def new_id():
    global _id
    _id += 1
    return _id


class Block:
    def __init__(self, _expr: typing.List[stmt], parent=None, last_item=None):
        self._id = new_id()
        assert (isinstance(parent, IfBlock) or parent is None), type(parent)
        self._parent: typing.Union[IfBlock] = parent
        self._last_item: Block = last_item
        self._expr: typing.List[stmt] = _expr

    def unparse(self):
        return astunparse.unparse(self._expr)

    def repr_last_item_and_parent(self):
        parent_id = self._parent._id if self._parent is not None else None
        last_item_id = self._last_item._id if self._last_item is not None else None
        return f"last_item: {last_item_id}\n parent: {parent_id}"

    def __repr__(self):
        return f"\n===========\n{self.__class__.__name__}\n {self.unparse()}\n {self.repr_last_item_and_parent()}\n"


class BasicBlock(Block):
    def __contains__(self, item: expr):
        for _expr in self._expr:
            if _expr == item:
                return True
        return False

    def first_expr(self):
        return self._expr[0]


class IfBlock(Block):
    def __init__(self, _expr: If, parent=None, last_item=None):
        super().__init__(_expr, parent, last_item)
        self._expr: If = _expr
        self.test = None
        self.expr_true = None
        self.expr_false = None
        self.parse_expr()

    def parse_expr(self):
        self.test = self._expr.test
        self.expr_true = self._expr.body
        self.expr_false = self._expr.orelse

    def first_expr(self):
        return self._expr

    def is_parent(self, block: BasicBlock):
        """
        判断是否为上层节点。
        :param block:
        :return:
        """
        if block.first_expr() in self.expr_true:
            return True
        if block.first_expr() in self.expr_false:
            return True
        return False

    def unparse(self):
        return f"\ncondition: {astunparse.unparse(self.test)}\n "


class CustomNodeVisitor(NodeVisitor):
    def __init__(self):
        self._blocks = []

    def recursive(func: typing.Callable):
        """ decorator to make visitor work recursive """

        def wrapper(self, node):
            func(self, node)
            for child in iter_child_nodes(node):
                self.visit(child)

        return wrapper

    @recursive
    def visit_FunctionDef(self, node: FunctionDef) -> typing.Any:
        funcdef_block = self.get_block_by_expr(node)
        self.visit_complex_content(node.body, funcdef_block)

    def visit_If(self, node: If) -> typing.Any:
        # print(self._blocks)
        if_block = self.get_block_by_expr(node)
        assert if_block is not None

        self.visit_complex_content(node.body, if_block)
        self.visit_complex_content(node.orelse, if_block)
        for item in node.body:
            self.visit(item)
        for item in node.orelse:
            self.visit(item)

    def visit_complex_content(self, exprs: typing.List[stmt], parent: typing.Union[IfBlock]):
        content = []
        current_basic_block: typing.List[stmt] = []
        for item in exprs:
            if len(content) > 0:
                last_item = content[-1]
            else:
                last_item = None
            if isinstance(item, If):
                content.append(BasicBlock(current_basic_block, parent=parent, last_item=last_item))
                current_basic_block = []
                content.append(IfBlock(item, parent=parent, last_item=last_item))
            else:
                current_basic_block.append(item)
        if len(content) > 0:
            last_item = content[-1]
        else:
            last_item = None
        if len(current_basic_block) > 0:
            content.append(BasicBlock(current_basic_block, parent=parent, last_item=last_item))
        self._blocks.extend(content)

    def get_block_by_expr(self, _expr):
        assert isinstance(_expr, (If, FunctionDef))
        for i, block in enumerate(self._blocks):
            if isinstance(block, BasicBlock):
                continue
            else:
                if block._expr is _expr:
                    return block

    def print(self):
        for i, block in enumerate(self._blocks):
            print(block._id, block)
            # print("parent:", self.find_parent(block))


s = """
import pprintast
import numpy as np
def func():
    b = 0
    c = 0
    if b>0:
        b+=1
        c-=1
        if c>1:
            a = np.array([1, 2, 3, i])
            a*=2
        else:
            break
        d+=1
    e = 123

"""

v = CustomNodeVisitor()
v.visit(parse(s))
v.print()

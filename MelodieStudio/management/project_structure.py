# -*- coding:utf-8 -*-
# @Time: 2021/9/28 14:00
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: add_sector_id.py.py
import sys

sys.path.append("/Users/hzy/Documents/Projects/MelodieABM/Melodie")
import ast
import os
from typing import Dict, List, Set, Optional, Tuple

import networkx as nx
from MelodieStudio.management.pycfg import get_cfg, get_all_function_cfgs, get_function_cfg


def get_all_funcdefs(python_file: str) -> List[ast.FunctionDef]:
    f = open(python_file, encoding='utf8', errors='replace')
    source = f.read()
    f.close()
    root = ast.parse(source)
    function_defs: List[ast.FunctionDef] = []
    for node in ast.walk(root):
        if type(node) == ast.FunctionDef:
            function_defs.append(node)
    return function_defs


def get_flow(source: str, func_name: str) -> Tuple[dict, dict]:
    # f = open(python_file, encoding='utf8', errors='replace')
    # source = f.read()
    # f.close()
    root = ast.parse(source)
    function_def: ast.FunctionDef = None
    for node in ast.walk(root):
        # print(ast.FunctionDef.name)
        if type(node) == ast.FunctionDef:
            if hasattr(node, 'name') and node.name == func_name:
                function_def = node
    if function_def is not None:
        return get_function_cfg(function_def)
    else:
        raise ValueError(f'Function {func_name} definition not in file {python_file}')
    return function_def


def list_all_files(parent_dir: str, ext_filter: Optional[Set[str]] = None) -> List[str]:
    """
    List all files in subdirectories recursively, matching the filter.
    :param parent_dir:
    :param ext_filter:
    :return:
    """
    if ext_filter is None:
        ext_filter = set()
    assert os.path.exists(parent_dir), f'Directory {parent_dir} not found!'
    all_files = []
    for root, dirs, files in os.walk(parent_dir):
        files = [file for file in files if os.path.splitext(file)[1] in ext_filter]
        for i, file in enumerate(files):
            file_abso_dir = os.path.join(root, file)
            files[i] = file_abso_dir
        all_files += files
    return all_files


def to_digraph(cfg: Dict, edge_tags: dict) -> nx.DiGraph:
    g = nx.DiGraph()
    for k, v in cfg.items():
        g.add_node(k, source=v['excel_source'])
        for child in v['children']:

            if (k, child) in edge_tags.keys():
                g.add_edge(k, child, tag=edge_tags[(k, child)])
            else:
                g.add_edge(k, child)

    return g


def to_mermaid(g: nx.DiGraph) -> str:
    sources: Dict[int, str] = nx.get_node_attributes(g, 'source')

    generated: List[str] = ['graph TD']
    for node in g.nodes:
        source = sources[node].replace('\"', "\'")
        source = source.replace('\n', "<br>")
        generated.append(f"{node}[\"{source}\"]")

    for edge in g.edges:
        tag = g.get_edge_data(edge[0], edge[1]).get('tag')
        if tag is not None:
            generated.append(f'{edge[0]}-->|{tag}|{edge[1]}')
        else:
            generated.append(f'{edge[0]}-->{edge[1]}')
    mermaid = '\n'.join(generated)
    return mermaid


def get_mermaid(file, func_name):
    flow, edge_tags = get_flow(file, func_name)
    dig = to_digraph(flow, edge_tags)
    mermaid = to_mermaid(dig)
    return mermaid


source = """
def f():
    a = 123
    b = 455
    if a>0:
        while 1:
            a+=1
            b = grid.get_agent_id()
            a1 = agent_list.get_agent_id(b)
            a2 = agent_list[b]
            if a>1000:
                break

"""

if __name__ == '__main__':
    flow, edge_tags = get_flow(source, 'f')
    dig = to_digraph(flow, edge_tags)
    mermaid = to_mermaid(dig)
    print(mermaid)
    with open('template.html', 'r') as f, open('output.html', 'w') as f2:
        f2.write(f.read().replace('$MERMAID', mermaid))
    # arcs = []
    # cfgs = get_all_function_cfgs(
    #     r'/Users/hzy/Documents/Projects/MelodieABM/MelodieStudioPackage/MelodieStudio/config_manager.py')
    # print(len(cfgs))
    # for f_cfg in cfgs:
    #     print(f_cfg)
    #     # digraph = to_digraph(f_cfg)
    #     # to_mermaid(digraph)

# -*- coding:utf-8 -*-
# @Time: 2021/10/20 20:21
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: config.py
import os
import sys

root = os.path.join(os.path.dirname(os.path.dirname(__file__)))
print(root)
sys.path.append(root)
# sys.path.append("/Users/hzy/Documents/Projects/MelodieABM/MelodieStudioPackage")
resources_path = os.path.join(os.path.dirname(__file__), "resources")

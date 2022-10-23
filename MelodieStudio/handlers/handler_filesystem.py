# -*- coding:utf-8 -*-
# @Time: 2021/11/16 10:53
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: handler_charts.py
from email.mime import base
import json
import os
import shutil
import time
from flask import Blueprint, request
from .messages import Response

file_system = Blueprint("fs", __name__)


def get_all_file_items(directory: str, one_layer=False):
    items = []
    for root, dirs, files in os.walk(directory):
        if not os.path.samefile(root, directory):
            continue
        else:
            got_dirs = []
            got_files = []
            for dir_name in dirs:
                got_dirs.append(
                    {
                        "name": dir_name,
                        "type": "directory",
                        "absPath": os.path.join(root, dir_name),
                    }
                )
            for file in files:
                got_files.append(
                    {"name": file, "type": "file", "absPath": os.path.join(root, file)}
                )
        got_dirs.sort(key=lambda item: item["name"])
        got_files.sort(key=lambda item: item["name"])
        items.extend(got_dirs)

        items.extend(got_files)
        if one_layer:
            break

    return items


@file_system.route("getFSItems")
def all_fs_items():
    directory: str = request.args.get("directory")
    if directory == "":
        directory = os.path.join(os.path.expanduser("~"), "Desktop")
    if os.path.exists(directory):
        return Response.ok(
            {
                "currentDirectory": directory,
                "fsItemsList": get_all_file_items(directory),
            }
        )
    else:
        return Response.error(f"Directory {directory} does not exist!")


@file_system.route("listDir")
def listdir():
    directory: str = request.args.get("directory")
    if not os.path.exists(directory):
        return Response.error(rf"Directory {directory} does not exist!")
    else:
        return Response.ok(
            {
                "currentDirectory": directory,
                "fsItemsList": get_all_file_items(directory, True),
            }
        )


@file_system.route("gotoParentDir")
def go_to_parent():
    directory: str = request.args.get("directory")
    if directory == "":
        directory = os.path.join(os.path.expanduser("~"), "Desktop")
    directory = os.path.dirname(directory)
    return Response.ok(
        {"currentDirectory": directory, "fsItemsList": get_all_file_items(directory)}
    )


@file_system.route("gotoSubDir")
def go_to_sub():
    directory: str = request.args.get("directory")
    subdir: str = request.args.get("subdir")
    if directory == "":
        directory = os.path.join(os.path.expanduser("~"), "Desktop")
    directory = os.path.join(directory, subdir)
    return Response.ok(
        {"currentDirectory": directory, "fsItemsList": get_all_file_items(directory)}
    )


@file_system.route("delete", methods=["POST"])
def delete_fs_item():
    item_abs_path: str = json.loads(request.data)["itemName"]

    if os.path.isfile(item_abs_path):
        os.remove(item_abs_path)
    else:
        shutil.rmtree(item_abs_path)
    return Response.success_msg("Successfully deleted filesystem item!")


@file_system.route("copy_to", methods=["POST"])
def copy_fs_item_to():
    data = json.loads(request.data)
    src = data["src"]
    target = data["target"]
    target_dir = os.path.dirname(target) if os.path.isfile(target) else target
    basename = os.path.basename(src)
    target_abspath = os.path.join(target_dir, basename)
    if os.path.isfile(src):
        shutil.copyfile(src, target_abspath)
    else:
        shutil.copytree(src, target_abspath)

    return Response.success_msg("Successfully moved filesystem item!")


@file_system.route("getFile", methods=["GET"])
def get_file():
    file_abs_path: str = request.args.get("fileName")
    if not (os.path.isfile(file_abs_path) and os.path.exists(file_abs_path)):
        return Response.error(
            f"Filename {file_abs_path} invalid. It may not exist or not a file."
        )
    else:
        with open(file_abs_path, encoding="utf8", errors="replace") as f:
            s = f.read()
            print(s)
            return Response.ok({"content": s})


@file_system.route("writeFile", methods=["POST"])
def write_file():
    data = json.loads(request.data)
    file_abs_path = data["fileName"]
    content = data["content"]
    with open(file_abs_path, "w", encoding="utf8") as f:
        f.write(content)

    return Response.success_msg("Saved successfully!")

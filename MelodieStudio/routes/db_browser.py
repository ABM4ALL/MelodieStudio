# -*- coding:utf-8 -*-
# @Time: 2021/12/11 10:05
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: db.py

import json

from flask import Blueprint, request

from MelodieStudio.manipulators.network_manipulator import NetworkManipulator
from MelodieStudio.routes.wrapper import wrapper_for_get

from ..models import Response
from .utils import args_not_none

from MelodieInfra import DatabaseQueryRequest, DatabaseService, DatabaseBasicRequest

db_browser = Blueprint("dbBrowser", __name__)

@db_browser.route("/query")
@wrapper_for_get(DatabaseQueryRequest)
def db_browser_query(req: DatabaseQueryRequest):
    return DatabaseService.query_database(req).to_json()


@db_browser.route("/tableNames")
@wrapper_for_get(DatabaseBasicRequest)
def browse_sqlite(req: DatabaseBasicRequest):
    return DatabaseService.table_names(req).to_json()


@db_browser.route("/read_network", methods=["GET"])
@args_not_none(['path'])
def read_network():
    path = request.args["path"]
    return Response.ok(NetworkManipulator(path).read_gexf_file())


@db_browser.route("/write_network", methods=["POST"])
def write_network():
    data = json.loads(request.data)
    path = data["path"]
    gexf_str = data["gexfString"]
    return Response.ok(NetworkManipulator(path).write_gexf_file(gexf_str))

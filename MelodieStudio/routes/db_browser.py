# -*- coding:utf-8 -*-
# @Time: 2021/12/11 10:05
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: db.py

import json
import os.path
import tempfile
from typing import Any, Dict, List, Union, cast

from flask import Blueprint, request
import pandas as pd

from MelodieStudio.manipulators.network_manipulator import NetworkManipulator
from MelodieStudio.manipulators.table_manipulator import ExcelManipulator

from .._config import get_studio_config
from ..models import Response
from .utils import args_not_none

from MelodieInfra import DBConn, ExcelWriteRequest, ExcelDataService, DataServiceState, ExcelReadSheetRequest

db_browser = Blueprint("dbBrowser", __name__)


def read_sql(db_type, meta, sql) -> dict:
    """
    Use pandas to read sql
    :param sql:
    :return:
    """
    engine = DBConn.create_from_existing_db(db_type, meta)
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        res = pd.read_sql(sql, engine)

        res.to_json(tf.name, orient="table", indent=4, index=False)
        data = tf.read()
        tf.close()
    engine.dispose()
    return json.loads(data)


def get_table_names(db_type: str, conn_params: Dict) -> List[str]:
    """

    :return:
    """
    conn = DBConn.create_from_existing_db(db_type, conn_params)
    table_names: List[str] = conn.table_names()
    return table_names


@db_browser.route("/query")
@args_not_none(['path'])
def db_browser_query():
    db_type = request.args.get("type")
    sql = request.args.get("sql")
    if db_type == "sqlite":
        conn_meta = {"path": request.args["path"]}
        if not os.path.exists(conn_meta["path"]):
            return Response.error(f"SQLite file {conn_meta['db_path']} not found!")
    else:
        return Response.error(f"Database type {request.args.get('type')} unsupported!")

    return Response.ok(read_sql(db_type, conn_meta, sql))


@db_browser.route("/tableNames")
def browse_sqlite():
    conn_meta = {}
    db_type = request.args.get("type")
    if db_type == "sqlite":
        path = request.args.get("path")
        if path is None:
            return Response.error(f"Argument of SQLite type db query request missing 'path'.")
        conn_meta = {"path": path}

        if not os.path.exists(conn_meta["path"]):
            return Response.error(f"SQLite file {conn_meta['db_path']} not found!")
    else:
        return Response.error(f"Database type {request.args.get('type')} unsupported!")
    return Response.ok(get_table_names(db_type, conn_meta))
    

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

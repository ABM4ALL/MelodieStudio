# -*- coding:utf-8 -*-
# @Time: 2021/12/11 10:05
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: db.py

import json
import os.path
import tempfile
from typing import Dict, List

from flask import Blueprint, request
import pandas as pd

from .._config import get_studio_config
from .messages import Response

try:
    from Melodie.db import create_db_conn, DBConn
except ImportError:
    import traceback

    traceback.print_exc()

db_browser = Blueprint('dbBrowser', __name__)


def df_to_json(df: pd.DataFrame):
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        df.to_json(tf.name, orient='table', indent=4, index=False)
        data = tf.read()
        tf.close()
    data = json.loads(data)
    for item in data["schema"]['fields']:
        if item['type'] == 'integer':
            item['type'] = 'number'
    return data


def read_sql(db_type, meta, sql) -> dict:
    """
    Use pandas to read sql
    :param sql:
    :return:
    """
    engine = DBConn.create_from_existing_db(db_type, meta)
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        res = pd.read_sql(sql, engine)

        res.to_json(tf.name, orient='table', indent=4, index=False)
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


@db_browser.route('/query')
def db_browser_query():
    db_type = request.args.get('type')
    sql = request.args.get('sql')
    if db_type == 'sqlite':
        conn_meta = {'path': request.args.get('path')}
        if not os.path.exists(conn_meta['path']):
            return Response.error(f"SQLite file {conn_meta['db_path']} not found!")
    else:
        return Response.error(f"Database type {request.args.get('type')} unsupported!")

    return Response.ok(read_sql(db_type, conn_meta, sql))


@db_browser.route('/tableNames')
def browse_sqlite():
    conn_meta = {}
    db_type = request.args.get('type')
    if db_type == 'sqlite':
        conn_meta = {'path': request.args.get('path')}
        if not os.path.exists(conn_meta['path']):
            return Response.error(f"SQLite file {conn_meta['db_path']} not found!")
    else:
        return Response.error(f"Database type {request.args.get('type')} unsupported!")
    return Response.ok(get_table_names(db_type, conn_meta))


@db_browser.route('/table_file_read')
def df_read():
    path = request.args.get('path')
    _, ext = os.path.splitext(path)
    ext = ext[1:]
    if ext in {'xls', 'xlsx'}:
        res = pd.read_excel(path)
        return Response.ok(df_to_json(res))
    else:
        raise NotImplementedError(f"Ext type {ext} unsupported!")


@db_browser.route('/table_file_write', methods=['POST'])
def df_write():
    print(request.data)
    data = json.loads(request.data)

    path = data['path']
    table_data = data['data']

    _, ext = os.path.splitext(path)
    ext = ext[1:]
    if ext in {'xls', 'xlsx'}:
        res = pd.DataFrame(table_data)
        try:
            res.to_excel(path, index=False)
            return Response.ok('Succeeded saved table file!')
        except Exception as e:
            return Response.ok(f"{e}")
    else:
        raise NotImplementedError(f"Ext type {ext} unsupported!")

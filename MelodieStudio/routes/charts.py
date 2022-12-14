# -*- coding:utf-8 -*-
# @Time: 2021/11/16 10:53
# @Author: Zhanyi Hou
# @Email: 1295752786@qq.com
# @File: handler_charts.py
import json
import os
from typing import Any, Dict

from flask import Blueprint, request
from ..services.json_config import JSONManager
from ..utils.config_manager import get_config_manager
from ..models import Response
charts = Blueprint("charts", __name__)


@charts.route("getChartPolicies")
def chart_policies():
    chart_type = request.args.get("chartType")
    t: Any = JSONManager.from_file(get_config_manager().chart_policies_file(), dict)
    policies: Dict
    policies, err = t
    if err is not None:
        return Response.error(err)
    if chart_type not in policies.keys():
        return Response.error(f"chart type {chart_type} not found!")
    else:
        return Response.ok(policies[chart_type])


@charts.route("chartOptions")
def chart_option():
    chart_name = request.args.get("chartName")
    t: Any = JSONManager.from_file(get_config_manager().chart_style_config_file(), dict)
    options: Dict
    options, err = t
    if err is not None:
        return Response.error(err)
    chart_options = options.get(chart_name)
    if chart_options is None:
        return Response.error(f"Chart option for '{chart_name}' not defined")
    else:
        return Response.ok(chart_options)


@charts.route("deleteChartOptions", methods=["post"])
def delete_chart_options():

    t: Any = JSONManager.from_file(get_config_manager().chart_style_config_file(), dict)
    options: Dict
    options, err = t
    if err is not None:
        return Response.error(err)
    data = json.loads(request.data)
    chart_name = data.get("chartName")
    if options.get(chart_name) is None:
        return Response.error(f"chart {chart_name} options not saved")
    else:
        options.pop(chart_name)
        err = JSONManager.to_file(
            options, get_config_manager().chart_style_config_file()
        )
        if err is not None:
            return Response.error(err)
        else:
            return Response.ok("ok")


@charts.route("setChartOptions", methods=["post"])
def set_chart_option():
    """
    This method will overwrite the whole config of one chart.

    :return:
    """
    style_config_file = get_config_manager().chart_style_config_file()
    options: Dict
    if os.path.exists(style_config_file):
        t: Any = JSONManager.from_file(style_config_file, dict)
        options, err = t
        if err is not None:
            return Response.error(err)
    else:
        options = {}
    data = json.loads(request.data)
    chart_name = data.get("chartName")
    chart_options = data.get("chartOptions")
    assert chart_name is not None
    options[chart_name] = chart_options
    err = JSONManager.to_file(options, style_config_file)
    if err is not None:
        return Response.error(err)
    else:
        return Response.ok("msg")


@charts.route("getLayout")
def get_layout():
    layout_file = get_config_manager().layout_file()

    options, err = JSONManager.from_file(layout_file, dict)
    if err is not None:
        return Response.error(err)
    else:
        return Response.ok(options)


@charts.route("saveLayout", methods=["post"])
def save_layout():
    data = json.loads(request.data)
    layout_file = get_config_manager().layout_file()
    layout_data = data["layout"]
    err = JSONManager.to_file(layout_data, layout_file)
    if err is not None:
        return Response.error(err)
    else:
        return Response.ok("Save layout succeeded")

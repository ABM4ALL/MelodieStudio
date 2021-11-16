from flask import Flask, Blueprint
from flask import request
from file_manager import JSONManager
from messages import Response
import json
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello Flask!'


charts = Blueprint('charts', __name__)


@charts.route('getChartPolicies')
def chart_policies():
    chart_type: str = request.args.get("chartType")
    policies, err = JSONManager.from_file('chart_policies.json', dict)
    if err is not None:
        return Response.error(err)
    if chart_type not in policies.keys():
        return Response.error(f"chart type {chart_type} not found!")
    else:
        return Response.ok(policies[chart_type])


@charts.route('chartOptions')
def chart_option():
    chart_name = request.args.get("chartName")
    options, err = JSONManager.from_file('chart_options.json', dict)
    if err is not None:
        return Response.error(err)
    chart_options = options.get(chart_name)
    if chart_options is None:
        return Response.error("chart option not defined")
    else:
        return Response.ok(chart_options)


@charts.route('deleteChartOptions', methods=["post"])
def delete_chart_options():
    options, err = JSONManager.from_file('chart_options.json', dict)
    if err is not None:
        return Response.error(err)
    data = json.loads(request.data)
    chart_name = data.get("chartName")
    if options.get(chart_name) is None:
        return Response.error(f"chart {chart_name} options not saved")
    else:
        options.pop(chart_name)
        err = JSONManager.to_file(options, "chart_options.json")
        if err is not None:
            return Response.error(err)
        else:
            return Response.ok("ok")


@charts.route('setChartOptions', methods=["post"])
def set_chart_option():
    options, err = JSONManager.from_file('chart_options.json', dict)
    if err is not None:
        return Response.error(err)
    data = json.loads(request.data)
    chart_name = data.get("chartName")
    chart_options = data.get("chartOptions")
    assert chart_name is not None
    options[chart_name] = chart_options
    err = JSONManager.to_file(options, "chart_options.json")
    if err is not None:
        return Response.error(err)
    else:
        return Response.ok("msg")


app.register_blueprint(charts, url_prefix="/api/charts")

if __name__ == '__main__':
    app.run(port=8089)

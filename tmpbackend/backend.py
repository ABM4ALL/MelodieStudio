import os
from flask import Flask
from flask import request
import json
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello Flask!'


@app.route('/api/charts/getChartPolicies')
def chart_policies():
    chart_type: str = request.args.get("chartType")
    with open('chart_policies.json', encoding="utf8") as f:
        policies = json.load(f)
    if chart_type not in policies.keys():
        return json.dumps({"status": 1, "message": f"chart type {chart_type} not found!"})
    else:
        return json.dumps({"status": 0, "data": policies[chart_type]})


@app.route('/api/charts/chartOptions')
def chart_option():
    chart_name = request.args.get("chartName")
    if not os.path.exists("chart_options.json"):
        return json.dumps({"status": 1, "message": "json file not found"})
    with open("chart_options.json", "r", encoding="utf8") as f:
        options = json.load(f)
    if not isinstance(options, dict):
        return json.dumps({"status": 1, "message": "json file format invalid"})
    chart_options = options.get(chart_name)
    if chart_options is None:
        return json.dumps({"status": 1, "message": "chart option not defined"})
    return json.dumps({"status": 0, "data": chart_options})
    # return 'Hello Flask!'


@app.route('/api/charts/deleteChartOptions', methods=["post"])
def delete_chart_options():
    options: dict = None
    if os.path.exists("chart_options.json"):
        try:
            with open("chart_options.json", "r", encoding="utf8") as f:
                options = json.load(f)
                if not isinstance(options, dict):
                    return json.dumps({"status": 1, "msg": f"Json decode type error: type {options}"})
        except json.JSONDecodeError:
            return json.dumps({"status": 1, "msg": "Json decode error"})
    else:
        return json.dumps({"status": 1, "msg": "Json file not found"})
    data = json.loads(request.data)
    chart_name = data.get("chartName")
    if options.get(chart_name) is None:
        return json.dumps({"status": 1, "msg": f"chart {chart_name} options not saved"})
    else:
        options.pop(chart_name)
    with open("chart_options.json", "w", encoding="utf8") as f:
        json.dump(options, f, indent=4)
    return json.dumps({"status": 0, "msg": "ok"})
    # return 'Hello Flask!'


@app.route('/api/charts/setChartOptions', methods=["post"])
def set_chart_option():
    options: dict = None
    if os.path.exists("chart_options.json"):
        try:
            with open("chart_options.json", "r", encoding="utf8") as f:
                options = json.load(f)
        except json.JSONDecodeError:
            options = {}
    else:
        options = {}
    data = json.loads(request.data)
    chart_name = data.get("chartName")
    chart_options = data.get("chartOptions")
    print(data)
    options[chart_name] = chart_options
    with open("chart_options.json", "w", encoding="utf8") as f:
        json.dump(options, f, indent=4)
    return json.dumps({"status": 0, "msg": "ok"})
    # return 'Hello Flask!'


if __name__ == '__main__':
    app.run(port=8089)

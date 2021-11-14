import os
from flask import Flask
from flask import request
import json
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello Flask!'


@app.route('/api/chartOptions')
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


@app.route('/api/setChartOptions', methods=["post"])
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

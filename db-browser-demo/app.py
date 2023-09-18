import json
import os
import sys
import io
import tempfile
import time
import chardet
from flask import Blueprint, request, send_file
import pandas as pd
from services import (
    SafetyCase,
    get_table_schema,
    add_safety_case_from_dict,
    get_safety_case,
    update_safety_case_from_dict,
    COLUMN_SCHEMA_SAFETY_CASE,
    delete_safety_case,
    export_table,
    get_all_tables,
)


sys.path.append("../")
try:
    from MelodieStudio.models.messages import Response
    from MelodieStudio import studio_main
    from MelodieStudio.main import app
except Exception:
    import traceback

    traceback.print_exc()
    sys.exit()

safety_info_db = Blueprint("safety-info-db", __name__)


@safety_info_db.route("create_safety_info", methods=["post"])
def add():
    tableName = request.args["tableName"]
    data = json.loads(request.data)
    data["id"] = None
    safety_case = add_safety_case_from_dict(tableName, data)
    return Response.ok(safety_case)


@safety_info_db.route("get_all_safety_info", methods=["get"])
def all_fetch():
    tableName = request.args["tableName"]
    return Response.ok(get_safety_case(tableName))


@safety_info_db.route("update_safety_info", methods=["post"])
def update_safety_info():
    tableName = request.args["tableName"]
    data = json.loads(request.data)
    update_safety_case_from_dict(tableName, data)
    return Response.ok("updated!")


@safety_info_db.route("delete_safety_info", methods=["post"])
def delete_safety_info():
    tableName = request.args["tableName"]
    data = json.loads(request.data)
    delete_safety_case(tableName, data)
    return Response.ok("updated!")


@safety_info_db.route("column_schemas", methods=["get"])
def get_schemas():
    tableName = request.args["tableName"]
    schema = get_table_schema(tableName)
    return Response.ok(schema.to_json())


@safety_info_db.route("all_tables", methods=["get"])
def all_tables():
    return Response.ok(get_all_tables())


@safety_info_db.route("importData", methods=["post"])
def import_data():
    tableName = request.args["tableName"]
    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return Response.error("No file uploaded!")
    temp_folder = tempfile.TemporaryDirectory(str(int(time.time())))
    file = os.path.join(temp_folder.name, uploaded_file.filename)

    uploaded_file.save(file)
    if file.endswith(".csv"):
        with open(file, "rb") as f:
            result = chardet.detect(f.read())
            encoding = result["encoding"]
        df = pd.read_csv(file, encoding=encoding, encoding_errors="replace")
        for column in list(df.columns):
            print(get_table_schema(tableName).columns)
            colname = get_table_schema(tableName).label_to_name(column)
            df.rename(columns={column: colname}, inplace=True)
        data = df.to_dict(orient="records")
        for item in data:
            # print(item)
            d = {k: v if isinstance(v, str) else "" for k, v in item.items()}
            if "id" in d:
                del d["id"]
            try:
                add_safety_case_from_dict(tableName, d)
            except:
                print("无法添加", d)
    return Response.ok("Ok!")


@safety_info_db.route("export_table", methods=["get"])
def export_this_table():
    tableName = request.args["tableName"]
    tmpfile: str = export_table(tableName)
    return send_file(tmpfile)


app.register_blueprint(safety_info_db, url_prefix="/api/safety-info-db")


if __name__ == "__main__":
    studio_main()

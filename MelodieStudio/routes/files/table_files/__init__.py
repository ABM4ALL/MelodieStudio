from flask import Blueprint
from .conversions import conversions_blueprint
from .excel import excel_blueprint

table_files = Blueprint("tableFiles", "tableFiles")
table_files.register_blueprint(excel_blueprint, url_prefix="excel")
table_files.register_blueprint(conversions_blueprint, url_prefix="conversions")

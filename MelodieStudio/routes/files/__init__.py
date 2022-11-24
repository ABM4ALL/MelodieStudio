from flask import Blueprint
from .table_files import table_files

files_blueprint = Blueprint('files', "files")
files_blueprint.register_blueprint(table_files, url_prefix="tableFiles")
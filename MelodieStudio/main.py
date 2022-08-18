import logging
import os.path
import subprocess
import sys
import threading
import time
from typing import Optional, TYPE_CHECKING

from flask import Flask, redirect
from ._config import set_studio_config
from .handler_charts import charts
from .handler_db_browser import db_browser
from .handler_filesystem import file_system
from .handler_tools import tools
from .config_manager import init_config_manager
from .hotupdate import start_watch_fs, create_runner
from .handler_ws import register_websocket_handlers, send_subprocess_output
if TYPE_CHECKING:
    from Melodie import Config

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'), static_url_path='')
app.register_blueprint(charts, url_prefix="/api/charts")
app.register_blueprint(db_browser, url_prefix="/api/dbBrowser")
app.register_blueprint(file_system, url_prefix="/api/fs")
app.register_blueprint(tools, url_prefix="/api/tools")

logger = logging.getLogger(__name__)


@app.route('/')
def handle_root():
    return redirect('http://localhost:8089/index.html', code=301)


def studio_main(config: "Config" = None):
    """
    Main function for studio server.

    :param config:
    :return:
    """
    set_studio_config(config)
    if config is None:
        conf_folder = os.path.join(os.getcwd(), ".melodiestudio")
    else:
        conf_folder = os.path.join(config.project_root, '.melodiestudio')
    init_config_manager(conf_folder)
    if config is not None:
        if os.path.exists(config.visualizer_entry):
            create_runner(config)
            start_watch_fs(config.project_root, create_runner)
        else:
            logger.warning("No visualizer entry defined in Config.")
    register_websocket_handlers(app)
    # chart_handler_main()
    app.run(host='0.0.0.0', port=8089)

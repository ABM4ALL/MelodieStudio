import logging
import os
import time
from typing import TYPE_CHECKING
import argparse
from threading import current_thread
from flask import Flask, redirect, g as app_ctx, current_app, request
from ._config import set_studio_config
from .handlers import (
    db_browser,
    file_system,
    tools,
    register_websocket_handlers,
    charts,
    pty_mgr,
)
from .utils.config_manager import init_config_manager, get_workdir, set_workdir
from .hotupdate import start_watch_fs, create_runner

if TYPE_CHECKING:
    from Melodie import Config

args_parser = argparse.ArgumentParser(description="Melodie Studio")
args_parser.add_argument("--workdir", help="The workdir where MelodieStudio serve")

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), "static"),
    static_url_path="",
)
app.register_blueprint(charts, url_prefix="/api/charts")
app.register_blueprint(db_browser, url_prefix="/api/dbBrowser")
app.register_blueprint(file_system, url_prefix="/api/fs")
app.register_blueprint(tools, url_prefix="/api/tools")
app.register_blueprint(pty_mgr, url_prefix="/api/pty")

logger = logging.getLogger(__name__)


@app.before_request
def logging_before():
    # Store the start time for the request
    app_ctx.start_time = time.perf_counter()


@app.after_request
def logging_after(response):
    # Get total time in milliseconds
    total_time = time.perf_counter() - app_ctx.start_time
    time_in_ms = int(total_time * 1000)
    # Log the time taken for the endpoint
    current_app.logger.info(
        "%s ms %s %s %s %s", time_in_ms, request.method, request.path, dict(request.args), current_thread()
    )
    return response


@app.route("/")
def handle_root():
    return redirect("http://localhost:8089/index.html", code=301)


def studio_main(config: "Config" = None):
    """
    Main function for studio server.

    :param config:
    :return:
    """
    set_studio_config(config)
    args = args_parser.parse_args()
    if args.workdir is None:
        wd = os.getcwd()
    else:
        wd = args.workdir
        wd = os.path.abspath(wd)
        assert os.path.exists(wd), FileNotFoundError(f"Workdir {wd} not found!")
    set_workdir(wd)
    if config is None:
        conf_folder = os.path.join(wd, ".melodiestudio")
    else:
        conf_folder = os.path.join(config.project_root, ".melodiestudio")
    init_config_manager(conf_folder)
    if config is not None:
        if os.path.exists(config.visualizer_entry):
            create_runner(config)
            start_watch_fs(config.project_root, create_runner)
        else:
            logger.warning("No visualizer entry defined in Config.")
    else:
        start_watch_fs(get_workdir(), create_runner)
    register_websocket_handlers(app)
    app.run(host="0.0.0.0", port=8089)

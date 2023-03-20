import argparse
from contextlib import closing
import logging
import os
import socket
import sys
import threading
import time

from typing import TYPE_CHECKING, Optional
from threading import current_thread

from flask import Flask, redirect, g as app_ctx, current_app, request

from MelodieInfra import Config

from MelodieStudio.gateway.gateway import start_gateway_thread

from ._config import set_studio_config
from .routes import (
    db_browser,
    file_system,
    tools,
    register_websocket_handlers,
    charts,
    pty_mgr,
    files_blueprint,
    visualizer_mgr,
    lowcode
)
from .utils.config_manager import init_config_manager, get_workdir, set_workdir, get_config_manager
from .hotupdate import start_watch_fs, create_runner
from .window import show_window



args_parser = argparse.ArgumentParser(description="Melodie Studio")
args_parser.add_argument(
    "--workdir", help="The workdir where MelodieStudio serve")

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
app.register_blueprint(files_blueprint, url_prefix="/api/files")
app.register_blueprint(visualizer_mgr, url_prefix="/api/visualizer")
app.register_blueprint(lowcode, url_prefix="/api/lowcode")


app.logger.setLevel(logging.ERROR)

logging.getLogger("werkzeug").setLevel(logging.ERROR)

logger = logging.getLogger("studio-server-main")
logger.setLevel(logging.INFO)

@app.before_request
def logging_before():
    # Store the start time for the request
    app_ctx.start_time = time.perf_counter()


@app.after_request
def logging_after(response):
    # Get total time in milliseconds
    if hasattr(app_ctx, 'start_time'):
        total_time = time.perf_counter() - app_ctx.start_time
        time_in_ms = int(total_time * 1000)
    else:
        time_in_ms = 'unknown'
    # Log the time taken for the endpoint
    logger.info(
        "%s ms %s %s %s %s", time_in_ms, request.method, request.path, dict(
            request.args), current_thread()
    )
    return response


@app.route("/")
def handle_root():
    return redirect(f"http://{request.host}/index.html", code=301)

def find_free_port():
    """
    Find an unused port for studio server.

    """
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]

def studio_main(config: Optional[Config] = None):
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
        assert os.path.exists(wd), FileNotFoundError(
            f"Workdir {wd} not found!")
    set_workdir(wd)
    if config is None:
        conf_folder = os.path.join(wd, ".melodie", 'studio')
    else:
        conf_folder = os.path.join(config.project_root, ".melodie", "studio")
    init_config_manager(conf_folder)
    conf_manager = get_config_manager()

    studio_logfile = open(conf_manager.get_studio_log_file(), 'w', encoding='utf8', errors="ignore")

    logging.basicConfig(stream=studio_logfile, level=logging.INFO)

    if config is not None:
        if os.path.exists(config.visualizer_entry):
            create_runner(config)
            start_watch_fs(config.project_root, create_runner)
        else:
            logger.warning("No visualizer entry defined in Config.")
    else:
        start_watch_fs(get_workdir(), create_runner)
    register_websocket_handlers(app)

    studio_port = find_free_port()
    gateway_thread = start_gateway_thread(
        conf_manager.basic_config.PORT, studio_port=studio_port)
    th = threading.Thread(target=lambda: app.run(host="0.0.0.0", port=studio_port))
    info = f"""
Melodie Studio is running on: 
- Gateway:          {conf_manager.basic_config.PORT}
- Studio Service:   {studio_port}
- Visualizer:       {conf_manager.basic_config.CURRENT_VISUALIZER_HOST}

Please visit this url http://localhost:{conf_manager.basic_config.PORT} to open the visualizer.

If MelodieStudio cannot connect to the visualizer, please check if the visualizer host in webpage is corresponding to the visualizer configuration.
"""
    logger.info(info)
    print(info, file=sys.stderr)
    th.setDaemon(True)
    th.start()
    # try:
    #     show_window()
    # except BaseException:
    #     import traceback
    #     traceback.print_exc()
    while 1:
        time.sleep(1)

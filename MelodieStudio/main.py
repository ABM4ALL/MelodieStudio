import logging
import os.path
from typing import TYPE_CHECKING
import argparse
from flask import Flask, redirect
from ._config import set_studio_config
from .handlers import db_browser, file_system, tools, register_websocket_handlers, charts, pty_mgr
from .utils.config_manager import init_config_manager, get_workdir, set_workdir
from .hotupdate import start_watch_fs, create_runner

if TYPE_CHECKING:
    from Melodie import Config

args_parser = argparse.ArgumentParser(description='Melodie Studio')
args_parser.add_argument('--workdir',
                         help='The workdir where MelodieStudio serve')
args = args_parser.parse_args()
app = Flask(__name__, static_folder=os.path.join(
    os.path.dirname(__file__), 'static'), static_url_path='')
app.register_blueprint(charts, url_prefix="/api/charts")
app.register_blueprint(db_browser, url_prefix="/api/dbBrowser")
app.register_blueprint(file_system, url_prefix="/api/fs")
app.register_blueprint(tools, url_prefix="/api/tools")
app.register_blueprint(pty_mgr, url_prefix="/api/pty")

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
    if args.workdir is None:
        wd = os.getcwd()
    else:
        wd = args.workdir
        assert os.path.exists(wd), FileNotFoundError(
            f"Workdir {wd} not found!")
    set_workdir(wd)
    if config is None:
        conf_folder = os.path.join(wd, ".melodiestudio")
    else:
        conf_folder = os.path.join(config.project_root, '.melodiestudio')
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
    # chart_handler_main()
    app.run(host='0.0.0.0', port=8089)

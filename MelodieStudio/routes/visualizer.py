import json
from flask import Blueprint, request
from ..utils.config_manager import get_config_manager
from ..models.messages import Response
visualizer_mgr = Blueprint("visualizer", __name__)

@visualizer_mgr.route("/hosts/set", methods=["POST"])
def set_current_visualizer_host():
    host = json.loads(request.data)['host']
    conf_mgr = get_config_manager()
    if host not in conf_mgr.basic_config.ALL_VISUALIZER_HOSTS:
        conf_mgr.basic_config.ALL_VISUALIZER_HOSTS.append(host)
    conf_mgr.basic_config.CURRENT_VISUALIZER_HOST = host
    return Response.success_msg("Successfully deleted filesystem item!")

@visualizer_mgr.route("/hosts/all", methods=["GET"])
def get_all_visualizer_hosts():
    conf_mgr = get_config_manager()
    return Response.ok(conf_mgr.basic_config.ALL_VISUALIZER_HOSTS)

@visualizer_mgr.route("/hosts/current", methods=["GET"])
def get_current_visualizer_host():
    conf_mgr = get_config_manager()
    return Response.ok(conf_mgr.basic_config.CURRENT_VISUALIZER_HOST)
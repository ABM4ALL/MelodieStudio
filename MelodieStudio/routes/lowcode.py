import json
import os
import importlib
import sys
from flask import Blueprint

from MelodieInfra import Action, Process
from MelodieStudio.utils.config_manager import get_workdir

from ..models import Response

lowcode = Blueprint("lowcode", __name__)


def get_list_head(l: list, no_more_than: int = 5):
    if len(l) > no_more_than:
        return l[:no_more_than]
    else:
        return l


@lowcode.route("actions")
def get_actions():
    wd = get_workdir()
    if wd not in get_list_head(sys.path):
        sys.path.insert(0, wd)
    if 'source.actions' in sys.modules:
        del sys.modules['source.actions']
    module = __import__("source.actions")
    
    actions = {}
    for prop_name, prop in module.actions.__dict__.items():
        if isinstance(prop, type) and issubclass(prop, Action) and prop not in (Action, Process):
            actions[prop_name] = prop().to_desc_json_dumpable()

    print(module, actions, json.dumps(actions))
    return Response.ok(actions)

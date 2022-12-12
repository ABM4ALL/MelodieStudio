
from functools import wraps
import json
from typing import List, Type

from flask import request
from MelodieInfra.jsonobject import JsonObject
from MelodieStudio.models.messages import Response

"""
Wrap the handler functions to this format:

@app.route('/xxxx')
@wrapper_for_get(req_type: Type[ArgsModel<JsonObject>])
or: @wrapper_for_post(req_type: Type[DataModel<JsonObject>])
def handler(req: ArgsModel/DataModel) -> str
    ...
    return xxxx
"""


def request_wrapper(req_type: Type[JsonObject], method: str):
    def wrapper(func2):
        @wraps(func2)  # Wraps could eliminate the side effect of decorator.
        def inner(*args, **kwargs):
            if method == 'POST':
                req = req_type(json.loads(request.data))
                return func2(req)
            elif method == 'GET':
                req = req_type(request.args.to_dict())
                return func2(req)
            else:
                raise NotImplementedError(
                    f"Unrecognized request method: {method}")
        return inner
    return wrapper


def wrapper_for_get(req_type: Type[JsonObject]):
    return request_wrapper(req_type, 'GET')

def wrapper_for_post(req_type: Type[JsonObject]):
    return request_wrapper(req_type, 'POST')

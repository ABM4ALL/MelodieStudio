from typing import List
from functools import wraps

from flask import request

from ..models import Response


def args_not_none(args_to_verify: List[str]):
    def wrapper(func2):
        @wraps(func2) # Wraps could eliminate the side effect of decorator.
        def inner(*args, **kwargs):
            fail = False
            args_is_none = []
            for argument in args_to_verify:
                if request.args.get(argument) is None:
                    fail = True
                    args_is_none.append(argument)
            if not fail:                    
                return func2(*args, **kwargs)
            else:
                return Response.error(f"Argument '{args_is_none}' is/are None in the request!")
        return inner
    return wrapper

import json
import os
import sys
import io
import tempfile
import time
from flask import Blueprint, request
from database import (
    SafetyCase,
    add_safety_case_from_dict,
    get_safety_case,
    update_safety_case_from_dict,
)

sys.path.append("../")
try:
    from MelodieStudio.models.messages import Response
    from MelodieStudio import studio_main
    from MelodieStudio.main import app
except Exception:
    import traceback

    traceback.print_exc()
    sys.exit()

safety_info_db = Blueprint("safety-info-db", __name__)


@safety_info_db.route("add_safety_info", methods=["post"])
def add():
    data = json.loads(request.data)
    add_safety_case_from_dict(data)
    return Response.ok("Ok!")


@safety_info_db.route("get_all_safety_info", methods=["get"])
def all_fetch():
    return Response.ok(get_safety_case())


@safety_info_db.route("update_safety_info", methods=["post"])
def update_safety_info():
    data = json.loads(request.data)
    update_safety_case_from_dict(data)
    return Response.ok("updated!")


app.register_blueprint(safety_info_db, url_prefix="/api/safety-info-db")


if __name__ == "__main__":
    if 0:
        draw_svg(
            """
    U32 carrNum = RxPhy_GetAllCarrNum(xxband, ACTIVATED);
    RETURN_IF(carrNum==0, M_OK);
    CHKToolLowAlmClear();
        """
        )
    studio_main()

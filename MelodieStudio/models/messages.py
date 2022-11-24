import json
import logging
from typing import Any
from MelodieInfra import DataServiceStatus
logger = logging.getLogger(__file__)


class Response:
    OK = 0
    ERROR = 1

    @staticmethod
    def _create_response(status: int, message: str, data: Any) -> str:
        assert status in {Response.OK, Response.ERROR}
        try:
            resp = json.dumps({"status": status, "msg": message, "data": data})
            if status == Response.ERROR:
                logger.info(resp)
            return resp
        except TypeError:
            import traceback

            traceback.print_exc()
            logger.error(str(data))
            return 'Internal error occurred in MelodieStudio'

    @staticmethod
    def ok(data: Any) -> str:
        return Response._create_response(Response.OK, "", data)

    @staticmethod
    def success_msg(msg: str) -> str:
        return Response._create_response(Response.OK, msg, {})

    @staticmethod
    def error(msg: str) -> str:
        return Response._create_response(Response.ERROR, msg, None)

    @staticmethod
    def resp_json_from_data_service_status(ds_status: DataServiceStatus):
        return ds_status.to_json()

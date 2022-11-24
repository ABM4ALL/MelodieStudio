from flask import Blueprint

from MelodieInfra import ExcelReadSheetRequest, ExcelWriteRequest, ExcelDataService, DataServiceState

from MelodieStudio.models.messages import Response
from MelodieStudio.routes.wrapper import wrapper_for_get, wrapper_for_post

excel_blueprint = Blueprint("excel", __name__)


@excel_blueprint.route("/read")
@wrapper_for_get(ExcelReadSheetRequest)
def df_read(req: ExcelReadSheetRequest):
    """
    Read a sheet from excel file.
    """
    stat = ExcelDataService.read_excel(req)
    if stat.status == DataServiceState.SUCCESS:
        return Response.ok(stat.data.to_json())
    else:
        return Response.error(stat.msg)


@excel_blueprint.route("/writeSheet", methods=["POST"])
@wrapper_for_post(ExcelWriteRequest)
def df_write(req):
    """
    Write data to excel file.
    """
    resp = ExcelDataService.write_excel(req)
    return Response.resp_json_from_data_service_status(resp)

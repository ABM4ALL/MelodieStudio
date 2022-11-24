import json
import pandas as pd
from flask import Blueprint, request

from MelodieStudio.models.messages import Response


conversions_blueprint = Blueprint("conversions", __name__)

@conversions_blueprint.route("/toLatex", methods=["POST"])
def table_to_latex():
    data = json.loads(request.data)
    table_data = data["data"]
    df = pd.DataFrame(table_data)
    return Response.ok(df.to_latex())
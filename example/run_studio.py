import sys, os

sys.path.append("/Users/hzy/Documents/Projects/MelodieABM/Melodie")
from MelodieStudio import studio_main
from Melodie import Config

cfg = Config(
    project_name="Demo",
    project_root=os.path.dirname(__file__),
    sqlite_folder="data/sqlite",
    excel_source_folder="data/excel_source",
    output_folder="data/output",
)

studio_main()

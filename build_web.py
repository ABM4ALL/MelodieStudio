import os
import shutil


STATIC_PATH = os.path.join(os.path.dirname(__file__), "MelodieStudio", "static")
WEBDIST_PATH = os.path.join(os.path.dirname(__file__), "webdist")
if os.path.exists(STATIC_PATH):
    shutil.rmtree(STATIC_PATH)
os.system("npm run build -- --dest=./webdist")
shutil.copytree(WEBDIST_PATH, STATIC_PATH)

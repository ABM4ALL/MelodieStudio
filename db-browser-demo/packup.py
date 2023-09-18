import os
import shutil

def find_file(directory):
    file = list(os.listdir(directory))[0]
    return os.path.join(directory, file)

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

wd = os.getcwd()
if os.path.exists("./dist"):
    shutil.rmtree("./dist")
if os.path.exists("./build"):
    shutil.rmtree("./build")
os.system("python build_web.py")
os.system("python setup.py bdist_wheel")
shutil.copy(find_file("dist"), os.path.join(wd, "safety-info-db", 'packages'))
os.chdir(r"C:\Users\houzh\Developing\MelodieProject\Melodie")
if os.path.exists("./dist"):
    shutil.rmtree("./dist")
if os.path.exists("./build"):
    shutil.rmtree("./build")
os.system("python setup.py bdist_wheel")


shutil.copy(find_file("dist"), os.path.join(wd, "safety-info-db", 'packages'))

os.chdir(wd)
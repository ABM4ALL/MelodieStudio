python3.8 setup.py sdist
#conda create -n testmelodie python==3.8.5 -y
cd dist
#source ~/.bash_profile
#conda activate testmelodie
python3.8 -c "import sys;print(sys.executable)"
pip install MelodieStudio-0.2.0.tar.gz
pip install pytest numpy
cd ../example
python run_studio.py
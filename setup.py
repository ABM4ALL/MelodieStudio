import json
import os
import shutil
import sys

import setuptools
STATIC_PATH = os.path.join(os.path.dirname(__file__), 'MelodieStudio', 'static')
WEBDIST_PATH = os.path.join(os.path.dirname(__file__), 'webdist')
if 'build_web' in sys.argv:
    if os.path.exists(STATIC_PATH):
        shutil.rmtree(STATIC_PATH)
    os.system("npm run build -- --dest=./webdist")
    shutil.copytree(WEBDIST_PATH, STATIC_PATH)
    sys.exit()
    
if 'update_interfaces' in sys.argv:
    os.system("python -m py_ts_interfaces.cli ./MelodieStudio/models.py -o src/models/models.ts")
    sys.exit()


setuptools.setup(
    name='MelodieStudio',
    version='0.2.0',
    description='A web-based toolbox for Melodie package.',
    long_description='',
    long_description_content_type='text/markdown',
    url='https://github.com/SongminYu/Melodie',
    author='Songmin Yu',
    author_email='songmin.yu@isi.fraunhofer.de',
    license='BSD 3',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Natural Language :: English',
        'Operating System :: Unix',
        'Operating System :: Microsoft :: Windows',
        'Programming Language :: Python :: 3',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
    ],
    project_urls={
        'Documentation': 'https://Melodie.readthedocs.io/en/latest/index.html',
    },
    packages=setuptools.find_namespace_packages(
        include=['MelodieStudio', 'MelodieStudio.*']
    ),
    install_requires=[
        'chardet',
        'websockets',
        'sqlalchemy',
        'flask',
        'flask_cors',
        'astunparse',
        'pprintast',
        "watchdog"
    ],
    python_requires='>=3.5',
    entry_points={
        'console_scripts': [
            'Melodie=Melodie.scripts.scripts:cli'
        ]
    },
    include_package_data=True,
)

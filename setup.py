import json
import os
import shutil
import sys

import setuptools


if 'update_interfaces' in sys.argv:
    os.system(
        "python -m py_ts_interfaces.cli ./MelodieStudio/models.py -o src/models/models.ts")
    sys.exit()

if os.path.exists('build'):
    shutil.rmtree('build')
setuptools.setup(
    name='MelodieStudio',
    version='0.3.0',
    description='A web-based toolbox for Melodie package.',
    long_description='',
    long_description_content_type='text/markdown',
    # url='https://github.com/SongminYu/Melodie',
    author='ABM4ALL',
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
        "watchdog",
        'flask_sock',
        'py_ts_interfaces',
        'jedi',
        "rpyc"
    ],
    python_requires='>=3.5',
    entry_points={
        'console_scripts': [
            'Melodie=Melodie.scripts.scripts:cli'
        ]
    },
    include_package_data=True,
)

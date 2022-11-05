import os
from config import resources_path
from MelodieStudio.static_analysis.checker import ComponentMeta


def test_checker_agent():
    ComponentMeta('MyAgent', 
    os.path.join(
        resources_path, 'scan_targets', 'agent.py'))

import os.path
from config import resources_path
from MelodieStudio.handlers.handler_filesystem import get_all_file_items
from MelodieStudio.manipulators.textfile_manipulator import TextfileManipulator


def test_fs_items():
    items = get_all_file_items(os.path.join(resources_path, "fs_demo"))
    assert len(items) == 3
    items_set = set()
    for item in items:
        items_set.add((item["name"], item["type"]))
    assert ("test.py", "file") in items_set
    assert ("test", "directory") in items_set
    assert ("README.md", "file") in items_set


def test_search():
    tm = TextfileManipulator(os.path.join(resources_path, "scan_targets", "target.py"))
    result = tm.search("abc")
    assert len(result) == 4
    for result_item in result:
        start = result_item["col"][0]
        end = result_item["col"][1]
        assert result_item["lineText"][start:end] == "abc"

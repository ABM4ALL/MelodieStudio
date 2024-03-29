from __future__ import print_function

import logging
import os
import subprocess
import sys
import threading
import time
from typing import Callable, Optional

from watchdog.events import (
    FileSystemEventHandler,
    FileMovedEvent,
    FileDeletedEvent,
)
from watchdog.observers import Observer

from MelodieInfra import Config

from MelodieStudio.routes.ws import (
    emit_added_fsitem_evt,
    emit_removed_fsitem_evt,
)

logger = logging.getLogger(__name__)
observer: Optional[Observer] = None
_current_runner = None


class FileMonitorHandler(FileSystemEventHandler):
    def __init__(self, watch_path: str, callback: Callable[[], None]):
        super(FileMonitorHandler, self).__init__()
        self._watch_path = watch_path
        self._callback = callback

    # def on_any_event(self, event: FileSystemEvent):
    #     if event.src_path.endswith(".py"):
    #         logger.info(f"file {event.src_path} changed, now update!")
    #         self._callback()
    def on_created(self, event):
        logger.warn(f"file {event.src_path} created, now update!")
        emit_added_fsitem_evt(event.src_path)

    def on_moved(self, event: FileMovedEvent):
        logger.warn(f"file {event.src_path} moved, now update!")
        emit_added_fsitem_evt(event.dest_path)
        emit_removed_fsitem_evt(event.src_path)

    def on_deleted(self, event: FileDeletedEvent):
        emit_removed_fsitem_evt(event.src_path)


class Runner:
    def __init__(self, executable_file: str = "run.py"):
        self.executable_file = executable_file
        self.p: Optional[subprocess.Popen] = None
        self.th_out = threading.Thread(target=self.stdout_loop)
        self.th_out.setDaemon(True)
        self.th_out.start()
        self.th_err = threading.Thread(target=self.stderr_loop)
        self.th_err.setDaemon(True)
        self.th_err.start()

    def stdout_loop(self):
        time.sleep(0.5)
        self.p = subprocess.Popen(
            [sys.executable, self.executable_file],
            shell=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )  # 使用管道
        while self.p.poll() is None:
            line = self.p.stdout.readline().decode("utf8")
            sys.stdout.write(line)

    def stderr_loop(self):
        while self.p is None:
            time.sleep(0.1)
            continue
        assert self.p is not None
        while self.p.poll() is None:
            line = self.p.stderr.readline().decode("utf8")
            sys.stderr.write(line)

    def stop(self):
        self.p.kill()
        logger.info("Previous runner killed")


def start_watch_fs(watch_dir: str, callback: Callable[[], None]):
    global observer
    assert observer is None
    event_handler = FileMonitorHandler(watch_dir, callback)
    observer = Observer()
    observer.schedule(event_handler, path=watch_dir, recursive=True)  # recursive递归的
    observer.start()


def create_runner(config: "Config"):
    global _current_runner
    if _current_runner is not None:
        _current_runner.stop()
        time.sleep(1)
    _current_runner = Runner(config.visualizer_entry)


if __name__ == "__main__":
    start_watch_fs(".", lambda: print("file changed!"))
    while 1:
        time.sleep(1)

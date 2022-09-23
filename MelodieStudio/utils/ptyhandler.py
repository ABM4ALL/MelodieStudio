from ast import List
import fcntl
from io import TextIOWrapper
import os
import select
import struct
import subprocess
import threading
import time
from turtle import right

from typing import Callable, NamedTuple
from .machine import is_windows
from .config_manager import get_workdir
NixProc = NamedTuple("NixProc", [('fd', TextIOWrapper), ('child_pid', int)])


class MelodiePTY:
    """
    Wrapper for winpty and builtin-pty
    """

    def __init__(self, term_id: str, command: str, on_output: Callable[[str], None]) -> None:
        self._on_output = on_output
        self._command = command
        self._thread: threading.Thread = None
        self.term_id: str = term_id
        self._win_proc: "PTY" = None

        self._nix_proc: NixProc = None
        if is_windows():
            self.create_on_windows()
        else:
            self.create_on_nix()
        # self.write(f'cd {get_workdir()}')

    def start_thread(self, func, args):
        self._thread = threading.Thread(
            target=func, args=args)
        self._thread.setDaemon(True)
        self._thread.start()

    def create_on_windows(self):
        from winpty import PTY

        def read_on_windows(proc: PTY):
            while proc.isalive():
                out = proc.read(blocking=False)
                if out == "":
                    time.sleep(0.1)
                else:
                    self._on_output(self.term_id, out)

        proc = PTY(80, 25)
        proc.spawn(self._command)
        self._win_proc = proc
        self.start_thread(read_on_windows, (proc,))

    def create_on_nix(self):
        import pty

        def read_on_nix(fd):
            max_read_bytes = 1024 * 20
            while True:
                time.sleep(0.01)
                timeout_sec = 0
                (data_ready, _, _) = select.select([fd], [], [], timeout_sec)
                if data_ready:
                    output = os.read(fd, max_read_bytes).decode()
                    # if output != "":
                    self._on_output(self.term_id, output)

        child_pid, fd = pty.fork()
        if child_pid == 0:
            subprocess.run(self._command)
        else:
            self._nix_proc = NixProc(fd, child_pid)
            self.start_thread(read_on_nix, (fd,))

    def write(self, input: str):
        if is_windows():
            self._win_proc.write(input)
        else:
            os.write(self._nix_proc.fd, input.encode())

    def resize(self, rows: int, cols: int):
        if is_windows():
            raise NotImplementedError
        else:
            import termios
            winsize = struct.pack("HHHH", rows, cols, 0, 0)
            fcntl.ioctl(self._nix_proc.fd, termios.TIOCSWINSZ, winsize)
        pass

import time
import os
import queue
import subprocess
import sys
import threading

from typing import Callable, List


def enqueue_stream(stream, queue, type):  # 将stderr或者stdout写入到队列q中。
    while 1:
        print('started enqueuing!')
        line = stream.read()
    # for line in iter(stream.read, b''):
        print('got line!')
        # queue.put(str(type) + line.decode('utf-8'))
        queue.put( line.decode('utf-8'))
    stream.close()


class SubprocessRunner:
    def __init__(self, cmd: List[str], on_output: Callable[[str], None]) -> None:
        self.process = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                                        shell=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.queue = queue.Queue()
        self.on_output = on_output
        to = threading.Thread(target=enqueue_stream,
                              args=(self.process.stdout, self.queue, 1))
        te = threading.Thread(target=enqueue_stream,
                              args=(self.process.stderr, self.queue, 2))
        tp = threading.Thread(target=self.mainLoop)
        to.setDaemon(True)
        te.setDaemon(True)
        tp.setDaemon(True)
        te.start()
        to.start()
        tp.start()

        self._threads = [to, tp, te]
        print('runner started!')

    def write(self, input: str):
        print('wrote to terminal:', input.encode('utf-8'))
        self.process.stdin.write(input.encode('utf-8'))
        self.process.stdin.flush()

    def mainLoop(self):
        while True:
            # print('loop!', time.time())
            if not self.queue.empty():
                line = self.queue.get()
                print('line', line)
                self.on_output(line)
            else:
                time.sleep(0.1)

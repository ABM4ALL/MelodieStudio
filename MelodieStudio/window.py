
import os
import sys
from typing import Tuple

from MelodieStudio.utils.config_manager import get_config_manager


def search_code(s: str, ptr: int) -> Tuple[str, int]:
    new_s = []
    for i in range(ptr, len(s)):
        new_s.append(s[i])
        if s[i] == 'm':
            return "".join(new_s), i
    return s[ptr: len(s)], ptr


class StderrRedirector:
    def __init__(self, text_widget) -> None:
        self.text_widget = text_widget

    def write(self, msg):
        import tkinter as tk
        lst = []
        ptr = 0
        while ptr < len(msg):
            ch = msg[ptr]
            if ch == '\x1b':
                s, ptr = search_code(msg, ptr)
                ptr += 1
            else:
                ptr += 1
                lst.append(ch)
        self.text_widget.insert(tk.END, "".join(lst))
        self.text_widget.see(tk.END)

    def flush(self):
        pass


def show_window():
    import logging

    def on_window_close():
        print("window close!")
        root.destroy()
        
    import tkinter as tk
    root = tk.Tk()
    root.title('MelodieStudio')
    root.protocol('WM_DELETE_WINDOW', on_window_close)
    icon_path = os.path.join(
        os.path.dirname(__file__), 'assets', 'icon.ico')
    if os.path.exists(icon_path):
        root.iconbitmap(icon_path)

    selectable_msg = tk.Text(root, relief='flat', bg='gray94', height=1,
                             wrap='word', font=('consolas', '9'))
    conf_manager = get_config_manager()
    selectable_msg.insert(
        1.0, f"http://127.0.0.1:{conf_manager.basic_config.PORT}")
    selectable_msg.configure(state='disabled')
    scroll_text = tk.Text(root)
    selectable_msg.pack(expand=True, fill=tk.X)
    scroll_text.pack(expand=True, fill=tk.BOTH)
    redirector = StderrRedirector(scroll_text)
    sys.stdout = redirector
    logging.basicConfig(stream=sys.stdout)
    root.mainloop()

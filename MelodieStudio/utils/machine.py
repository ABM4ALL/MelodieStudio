import platform


def is_windows():
    return platform.system().lower().find('windows') != -1

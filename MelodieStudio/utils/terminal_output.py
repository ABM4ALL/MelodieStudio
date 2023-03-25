import time


def show_spinner():
    pass


def rotating_spinner():
    spinner = ['-', '/', '|', '\\']
    i = 0
    while True:
        print(f"\rconnecting {spinner[i]}", end="")
        i = (i + 1) % len(spinner)
        time.sleep(0.1)


rotating_spinner()

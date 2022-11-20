import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
from .main import studio_main

studio_main()

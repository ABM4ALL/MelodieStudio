from .orm import Base
from .database import *

# 创建表结构
Base.metadata.create_all(engine)

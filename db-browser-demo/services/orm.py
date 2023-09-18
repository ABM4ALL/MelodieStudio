from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker, declarative_base
# 创建数据库连接
engine = create_engine(
    "sqlite:///xxxxcases.db", connect_args={"check_same_thread": False}
)

# 定义基类
Base = declarative_base()

# 创建会话
Session = sessionmaker(bind=engine)
session = Session()
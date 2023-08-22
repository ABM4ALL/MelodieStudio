import json
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker, declarative_base

# 创建数据库连接
engine = create_engine("sqlite:///safety_cases.db", connect_args={'check_same_thread': False})

# 定义基类
Base = declarative_base()


# 定义SafetyCase类
class SafetyCase(Base):
    __tablename__ = "safety_cases"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    name: str = Column(String)
    failure_phenomenon: str = Column(String)
    failure_mode: str = Column(String)
    failure_cause: str = Column(String)
    implications: str = Column(String)

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} {self.to_dict()}>"


# 创建表结构
Base.metadata.create_all(engine)

# 创建会话
Session = sessionmaker(bind=engine)
session = Session()


def add_safety_case_from_dict(data):
    # 添加示例数据
    safety_case = SafetyCase(**data)
    session.add(safety_case)
    session.commit()


def update_safety_case_from_dict(data):
    # 添加示例数据
    safety_case = SafetyCase(**data)
    if safety_case.id is None:
        raise ValueError(safety_case)
    session.query(SafetyCase).filter_by(id=safety_case.id).update(safety_case.to_dict())
    session.commit()


def get_safety_case():
    # 查询数据
    result = session.query(SafetyCase).all()  # .filter_by(name="CASE003").first()
    # print(result)
    return [item.to_dict() for item in result]


def delete_safety_case(id: int):
    # 删除数据
    session.query(SafetyCase).filter_by(id=id).delete()


if __name__ == "__main__":
    name, failure_phenomenon, failure_mode, failure_cause, implications = (
        "CASE003",
        "xxxxxx",
        "asd",
        "123",
        "ssss",
    )
    data = {
        "name": name,
        "failure_phenomenon": failure_phenomenon,
        "failure_mode": failure_mode,
        "failure_cause": failure_cause,
        "implications": implications,
    }
    add_safety_case_from_dict(data)
    data['failure_mode'] = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    # data['id']
    update_safety_case_from_dict(data)
    # 
    # print(SafetyCase.user_defined_props())
    # print()
    delete_safety_case(1)
    print(get_safety_case())
    # 关闭会话
    # session.close()

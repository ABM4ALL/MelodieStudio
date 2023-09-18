import json
import functools
from typing import Dict, Tuple
from tempfile import NamedTemporaryFile
from MelodieInfra import ColumnSchema, ColumnSchemas
import pandas as pd
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import sessionmaker, declarative_base
import inspect
from .orm import Base, engine, session


class SafetyInfoObject:
    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} {self.to_dict()}>"


# 定义SafetyCase类
class SafetyCase(Base, SafetyInfoObject):
    __tablename__ = "safety_cases"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    name: str = Column(String)
    failure_phenomenon: str = Column(String)
    failure_mode: str = Column(String)
    failure_cause: str = Column(String)
    implications: str = Column(String)


COLUMN_SCHEMA_SAFETY_CASE = ColumnSchemas(
    table_name="safety_cases",
    table_label="xxxx案例",
    columns=[
        ColumnSchema(name="id", type="str", label="序号", readonly=True, width=80),
        ColumnSchema(name="name", type="str", label="yy名称"),
        ColumnSchema(name="failure_phenomenon", type="str", label="xx现象"),
        ColumnSchema(name="failure_mode", type="str", label="xx模式"),
        ColumnSchema(name="failure_cause", type="str", label="xx原因分析", width=480),
        ColumnSchema(name="implications", type="str", label="xx启示"),
    ],
)


tables: Dict[str, Tuple[Base, ColumnSchemas]] = {
    "safety_cases": (SafetyCase, COLUMN_SCHEMA_SAFETY_CASE),
}


def get_orm_class(table_name: str):
    return tables[table_name][0]


def get_table_schema(table_name: str):
    return tables[table_name][1]


def get_all_tables():
    return [{"name": k, "label": v[1].table_label} for k, v in tables.items()]


# class
def add_safety_case_from_dict(table_name: str, data):
    # 添加示例数据
    cls = get_orm_class(table_name)
    safety_case = cls(**data)
    session.add(safety_case)
    session.flush()
    case_id = safety_case.id
    session.commit()
    safety_case = session.query(cls).filter_by(id=case_id).first()

    return safety_case.to_dict()


def update_safety_case_from_dict(table_name: str, data):
    # 添加示例数据
    cls = get_orm_class(table_name)
    safety_case = cls(**data)
    if safety_case.id is None:
        raise ValueError(safety_case)
    session.query(cls).filter_by(id=safety_case.id).update(safety_case.to_dict())
    session.commit()


def get_safety_case(table_name: str):
    # 查询数据
    cls = get_orm_class(table_name)
    result = session.query(cls).all()
    return [item.to_dict() for item in result]


def delete_safety_case(table_name: str, data):
    # 删除数据
    cls = get_orm_class(table_name)
    session.query(cls).filter_by(id=data["id"]).delete()

def export_table(table_name: str):
    # 导出表格，以csv格式。
    cases = get_safety_case(table_name)
    for case in cases:
        if 'id' in case:
            del case['id']
    df = pd.DataFrame(cases)
    
    for column in list(df.columns):
        print(get_table_schema(table_name).columns)
        colname = get_table_schema(table_name).name_to_label(column)

        df.rename(columns={column: colname}, inplace=True)

    tf = NamedTemporaryFile(suffix=".csv", delete=False)
    df.to_csv(tf, mode="wb", index=False)
    tf.close()
    return tf.name
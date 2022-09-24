import os
import openpyxl
import pandas as pd


class ExcelManipulator:
    def __init__(self, filename: str) -> None:
        self.filename = filename

    def get_sheet_names(self):
        return pd.ExcelFile(self.filename).sheet_names

    def read_sheet(self, sheet_name: str = None, **kwargs):
        return pd.read_excel(self.filename, sheet_name, **kwargs)

    def write_to_sheet(self, df: pd.DataFrame, sheet_name: str, **kwargs):
        book = None
        sheet_exist = False
        if os.path.exists(self.filename):
            book = openpyxl.load_workbook(self.filename)
            sheet_exist = sheet_name in self.get_sheet_names()
        if sheet_exist:
            with pd.ExcelWriter(self.filename, engine='openpyxl', mode="a", if_sheet_exists="replace") as writer:
                df.to_excel(writer, sheet_name=sheet_name, index=False)
        else:
            writer = pd.ExcelWriter(self.filename, engine='openpyxl')
            print(sheet_exist)
            if book is not None:
                writer.book = book
            df.to_excel(writer, sheet_name, index=False)
            writer.save()

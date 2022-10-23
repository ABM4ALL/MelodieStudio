import pandas as pd
import openpyxl
from config import resources_path
from MelodieStudio.manipulators.table_manipulator import ExcelManipulator

em = ExcelManipulator("out.xlsx")
em.write_to_sheet(pd.DataFrame([[2, 2, 2], [3, 4, 5]]), "sheet1")
em.write_to_sheet(pd.DataFrame([[2, 2, 2], [3, 4, 5]]), "sheet2")

print(em.get_sheet_names())
# pd.DataFrame([[2, 2, 2], [3, 4, 5]]).to_excel('out.xlsx', sheet_name='sheet1')
# book = openpyxl.load_workbook('out.xlsx')
# writer = pd.ExcelWriter('out.xlsx', engine='openpyxl')
# print(writer.path)
# writer.book = book
# pd.DataFrame([[1, 2, 3], [3, 4, 5]]).to_excel(writer, 'sheet2')
# writer.save()


# excel_total = pd.ExcelFile('out.xlsx')
# print(excel_total.sheet_names)
# pd.read_excel('out.xlsx',)

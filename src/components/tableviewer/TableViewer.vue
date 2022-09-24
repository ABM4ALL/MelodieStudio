<template>
  <div class="table-viewer-outer">
    <sheet-selector
      :sheetNames="allSheets"
      :currentSheet="currentSheet"
      @sheet-selected="handleSheetChange($event)"
    ></sheet-selector>
    <el-popover>
      <template #reference>
        <el-button>Table Edit...</el-button>
      </template>
      <el-button @click="addRow('after')">Add Row After</el-button>
      <el-button @click="addRow('before')">Add Row before</el-button>
      <el-button @click="removeRow()">Remove Row</el-button>
      <el-button @click="removeColumn()">Remove Column</el-button>
      <el-button @click="addColumn">Add Column</el-button>
    </el-popover>

    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          :columns="columns"
          :data="tableDataNew"
          :width="width"
          :height="height"
          fixed
        />
      </template>
    </el-auto-resizer>
  </div>
</template>
<style>
.table-viewer-outer {
  width: 100%;
  height: 100%;
}

.table-v2-inline-editing-trigger {
  min-width: 40px;
  min-height: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
}
</style>
<script setup lang="tsx">
import { readTableFile, writeTableFile } from "@/api/db";
import { ElInput, ElMessageBox, ElNotification, ElPopover } from "element-plus";
import {
  ref,
  onMounted,
  defineProps,
  computed,
  FunctionalComponent,
  resolveDynamicComponent,
  defineEmits,
} from "vue";
import { isEqual } from "lodash";
import { registerOnSaveCommand } from "../events/globalevents";
import {
  DataResponse,
  DataResponseMeta,
  ExcelResponseMeta,
  TableTypes,
} from "@/models/data_mani";
import SheetSelector from "./SheetSelector.vue";
import { number } from "echarts";
import { af } from "element-plus/es/locale";
const Input = resolveDynamicComponent("ElInput") as typeof ElInput;
const Popover = resolveDynamicComponent("ElPopover") as typeof ElPopover;
const props = defineProps({
  path: {
    required: true,
    type: String,
  },
});
type ColumnType = {
  key: string;
  dataKey: string;
  title: string;
  width: number;
  type: string;
  cellRenderer?: ({ rowData, column, rowIndex }) => any;
};

const emits = defineEmits(["unsaved"]);
const columns = ref<ColumnType[]>([]);
const tableData = ref<{ [key: string]: number | string }[]>([]);

const tableDataNew = ref<{ [key: string]: any }[]>([]);
const tableDataOriginal = { value: [] };
const tableType = ref<TableTypes>("csv");

/** Only take effect on excel files **/
const currentSheet = ref<string>("");
const allSheets = ref<string[]>([]);
const currentPos = ref<{ row: number; col: string }>({ row: 0, col: "" });

type SelectionCellProps = {
  value: string;
  intermediate?: boolean;
  onChange: (value: string) => void;
  forwardRef: (el: InstanceType<typeof ElInput>) => void;
  onBlur: (value: FocusEvent) => void;
  enterPressed: (value: KeyboardEvent) => void;
};

const InputCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  onChange,
  forwardRef,
  onBlur,
  enterPressed,
}) => {
  const popoverShow = ref(false);
  const onKeyDown = (evt: KeyboardEvent): any => {
    if (evt.key == "Enter") {
      enterPressed(evt);
    }
  };
  const onClick = (evt: MouseEvent): any => {
    console.log(evt);
    popoverShow.value = true;
  };
  // const handleBlur = (e)=>{
  //     console.log('blur!',e)
  // }
  return (
    <Input
      ref={forwardRef as any}
      onInput={onChange}
      modelValue={value}
      onKeydown={onKeyDown}
      onBlur={onBlur}
      onClick={onClick}
    />
  );
};

onMounted(async () => {
  reload(await getData());
});
const getData = async () => {
  return await readTableFile({ path: props.path });
};

const addRow = (pos: "after" | "before") => {
  console.log("add row!", currentPos.value);
  let split = 0;
  if (pos == "before") {
    split = currentPos.value.row;
  } else {
    split = currentPos.value.row + 1;
  }
  const before = tableDataNew.value.slice(0, split);
  const after = tableDataNew.value.slice(split);
  const newRow: { [key: string]: any } = {};
  for (const col of columns.value) {
    newRow[col.dataKey] = { value: null, editing: false };
  }
  console.log("before", before, "\nafter", after);
  tableDataNew.value = before.concat([newRow]).concat(after);
  console.log(tableDataNew.value);
};

const removeRow = () => {
  tableDataNew.value.splice(currentPos.value.row, 1);
};

const removeColumn = () => {
  const index = columns.value.findIndex(
    (col) => col.dataKey == currentPos.value.col
  );
  if (index == -1) {
    console.error("index was -1");
    return;
  }
  columns.value.splice(index, 1);
  for (const row of tableDataNew.value) {
    delete row[currentPos.value.col];
  }
};

const addColumn = async () => {
  const name = (
    await ElMessageBox.prompt("Input the column name", "New Column", {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      // inputPattern:
      //   /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
      // inputErrorMessage: 'Invalid Email',
    })
  ).value;
  console.log(name);
  columns.value.push({
    key: name,
    dataKey: name,
    title: name,
    width: 150,
    type: "number",
    cellRenderer,
  });
  for (const row of tableDataNew.value) {
    row[name] = { value: null, editing: false };
  }
};

const cellRenderer = ({ rowData, column, rowIndex }) => {
  const onChange = (value: string) => {
    rowData[column.dataKey!].value = value;
  };
  const onEnterEditMode = () => {
    rowData[column.dataKey!].editing = true;
    currentPos.value.col = column.dataKey;
    currentPos.value.row = rowIndex;
    console.log("rowIndex", rowIndex);
  };

  const onExitEditMode = () => {
    if (column.type == "number") {
      try {
        const num = Number(rowData[column.dataKey!].value);
        if (isNaN(num)) {
          throw `Cannot convert ${rowData[column.dataKey!].value} to number`;
        }
        rowData[column.dataKey!].value = num;
      } catch (err) {
        ElNotification.error(`${err}`);
        return;
      }
    }
    rowData[column.dataKey!].editing = false;

    emits("unsaved", true);
  };
  const input = ref();
  const setRef = (el) => {
    input.value = el;
    if (el) {
      el.focus?.();
    }
  };
  //    onBlur={onExitEditMode}
  return rowData[column.dataKey].editing ? (
    <InputCell
      forwardRef={setRef}
      value={rowData[column.dataKey!].value}
      onChange={onChange}
      onBlur={onExitEditMode}
      enterPressed={onExitEditMode}
    />
  ) : (
    <div class="table-v2-inline-editing-trigger" onClick={onEnterEditMode}>
      <div> {rowData[column.dataKey!].value}</div>
    </div>
  );
};

const handleSheetChange = async (newSheetName: string) => {
  const resp = await readTableFile({
    path: props.path,
    sheet: newSheetName,
  });
  await reload(resp);
};

const reload = async (resp: DataResponse) => {
  tableType.value == (resp.meta as ExcelResponseMeta).type;
  allSheets.value = (resp.meta as ExcelResponseMeta).sheetNames;
  currentSheet.value = (resp.meta as ExcelResponseMeta).currentSheet;

  const data = resp.payload;

  console.log(data);
  const cols: ColumnType[] = [
    {
      key: "_index",
      dataKey: "_index",
      title: "",
      width: 150,
      type: "integer",
      cellRenderer: ({ rowData, column, rowIndex }) => {
        return (
          <div class="table-v2-inline-editing-trigger">
            <div> {rowIndex + 1}</div>
          </div>
        );
      },
    },
  ];
  for (const colMeta of data.schema.fields) {
    cols.push({
      key: colMeta.name,
      dataKey: colMeta.name,
      title: colMeta.name,
      width: 150,
      type: colMeta.type,
      cellRenderer: cellRenderer,
    });
  }
  columns.value = cols;
  tableData.value = data.data;
  let counter = 1;
  for (const item of data.data) {
    item["_index"] = counter;
    counter++;
  }
  tableDataNew.value = calcTableDataNew();
  tableDataOriginal.value = JSON.parse(JSON.stringify(tableDataNew.value));
};

const isDataChanged = (): boolean => {
  return isEqual(tableDataNew.value, tableDataOriginal.value);
};

const calcTableDataNew = () =>
  tableData.value.map((values, rowIndex) => {
    return columns.value.reduce(
      (rowData, column, columnIndex) => {
        rowData[column.dataKey] = {
          value: values[column.dataKey],
          editing: false,
        };
        return rowData;
      },
      {
        id: `0`,
        parentId: null,
      }
    );
  });

const convertTableDataToJson = () => {
  const newData: { [key: string]: any }[] = [];
  for (const row of tableDataNew.value) {
    const newRow: { [key: string]: any } = {};
    console.log(newRow);
    for (const key in row) {
      if (!key.startsWith("_") && row[key] != null) {
        newRow[key] = row[key].value;
      }
    }

    newData.push(newRow);
  }
  console.log("newData", newData);
  return newData;
};

registerOnSaveCommand(() => {
  writeTableFile({
    path: props.path,
    data: convertTableDataToJson(),
    sheet: currentSheet.value,
  });
  emits("unsaved", false);
});
</script>

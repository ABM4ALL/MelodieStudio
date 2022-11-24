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
      <tool-button
        text="Insert Row After"
        icon="insert-row-after"
        @click="addRow('after')"
        :disabled="!hasCurrentEdit"
      >
      </tool-button>
      <tool-button
        text="Insert Row Before"
        icon="insert-row-before"
        @click="addRow('before')"
        :disabled="!hasCurrentEdit"
      >
      </tool-button>

      <tool-button
        text="Remove Row"
        icon="remove-row"
        @click="removeRow()"
        :disabled="!hasCurrentEdit"
      >
      </tool-button>
      <tool-button
        text="Remove Column"
        icon="remove-column"
        @click="removeColumn()"
        :disabled="!hasCurrentEdit"
      >
      </tool-button>
      <tool-button
        text="Insert Column Before"
        icon="insert-col-before"
        @click="addColumn('before')"
        :disabled="!hasCurrentEdit"
      >
      </tool-button>

      <tool-button
        text="Insert Column After"
        icon="insert-col-after"
        @click="addColumn('after')"
        :disabled="!hasCurrentEdit"
      >
      </tool-button>
    </el-popover>
    <el-popover trigger="click" :width="250">
      <template #reference>
        <el-button>Export table...</el-button>
      </template>
      <div style="display: flex; align-items: center">
        <div style="line-height: 32px">
          <svg-icon svg-icon-name="latex"></svg-icon>
        </div>
        As Latex..
        <div style="display: flex; flex-grow: 1"></div>
        <icon-button
          text="Convert whole table"
          icon="all"
          @click="onTableToLatex('all')"
        />
        <icon-button
          text="Convert selection only"
          icon="selection"
          @click="onTableToLatex('selection')"
        />
      </div>
    </el-popover>
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          :columns="columns"
          :data="tableDataNew"
          :width="width"
          :height="height"
          fixed
          @mousedown="onTableMouseDown"
          @mousemove="onTableMouseMove"
          @mouseup="onTableMouseUp"
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

.table-v2-selected {
  border: 1px solid #4578f3;
}
</style>
<script setup lang="tsx">
import { readTableFile, tableToLatex, writeTableFile } from "@/api/db";
import { ElInput, ElMessageBox, ElNotification, ElPopover } from "element-plus";
import SvgIcon from "../basic/SvgIcon.vue";
import {
  ref,
  onMounted,
  defineProps,
  computed,
  FunctionalComponent,
  resolveDynamicComponent,
  defineEmits,
  onBeforeUnmount,
} from "vue";
import { isEqual } from "lodash";
import {
  registerOnSaveCommand,
  unregisterOnSaveCommand,
} from "../events/globalevents";
import {
  DataResponse,
  DataResponseMeta,
  ExcelResponseMeta,
  TableTypes,
} from "@/models/data_mani";
import SheetSelector from "./SheetSelector.vue";
import ToolButton from "@/components/basic/ToolButton.vue";
import IconButton from "@/components/basic/IconButton.vue";
import { insertAfter } from "@/utils/utils";
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
  cellRenderer?: ({ rowData, column, rowIndex, columnIndex }) => any;
};

const emits = defineEmits(["unsaved"]);
const columns = ref<ColumnType[]>([]);
const tableData = ref<{ [key: string]: number | string }[]>([]);

const tableDataNew = ref<{ [key: string]: any }[]>([]);
const tableType = ref<TableTypes>("csv");

/** Only take effect on excel files **/
const currentSheet = ref<string>("");
const allSheets = ref<string[]>([]);
const currentPos = ref<{ row: number; col: string; enabled: boolean }>({
  row: 0,
  col: "",
  enabled: false,
});

/* Selection area */
const selection = ref<{
  startRowIndex: number;
  endRowIndex: number;
  startColIndex: number;
  endColIndex: number;
}>({
  startRowIndex: -1,
  endRowIndex: -1,
  startColIndex: -1,
  endColIndex: -1,
});
const existedEditWidgets = ref<number>(0);

const hasCurrentEdit = computed(() => {
  return existedEditWidgets.value == 1;
});

const onTableMouseDown = () => {
  console.log("mousedown");
};

const onTableMouseUp = () => {
  console.log("mousedown");
};

const onTableMouseMove = (evt: MouseEvent) => {
  if (evt.buttons == 1) {
    console.log("mousemove");
  }
};

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
    popoverShow.value = true;
  };
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

const onToolbuttonMouseDown = (evt: PointerEvent) => {
  evt.preventDefault();
};

const addRow = (pos: "after" | "before") => {
  let split = 0;
  if (pos == "before") {
    split = currentPos.value.row;
  } else {
    split = currentPos.value.row + 1;
  }
  const newRow: { [key: string]: any } = {};
  for (const col of columns.value) {
    newRow[col.dataKey] = { value: null, editing: false };
  }
  tableDataNew.value = insertAfter(tableDataNew.value, newRow, split);
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

const addColumn = async (pos: "before" | "after") => {
  const name = (
    await ElMessageBox.prompt("Input the column name", "New Column", {
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
    })
  ).value;
  let split = 0;
  const colIndex = columns.value.findIndex(
    (col) => col.dataKey == currentPos.value.col
  );
  if (pos == "before") {
    split = colIndex;
  } else {
    split = colIndex + 1;
  }
  columns.value = insertAfter(
    columns.value,
    {
      key: name,
      dataKey: name,
      title: name,
      width: 150,
      type: "number",
      cellRenderer,
    },
    split
  );
  for (const row of tableDataNew.value) {
    row[name] = { value: null, editing: false };
  }
};

const cellRenderer = ({ rowData, column, rowIndex, columnIndex }) => {
  const onChange = (value: string) => {
    rowData[column.dataKey!].value = value;
  };
  const onEnterEditMode = () => {
    existedEditWidgets.value += 1;
    rowData[column.dataKey!].editing = true;
    currentPos.value.col = column.dataKey;
    currentPos.value.row = rowIndex;
  };

  const onExitEditMode = () => {
    existedEditWidgets.value -= 1;
    if (column.type == "number") {
      try {
        // 有可能当前数据已经被删除，这种情况下就无需修改赋值，因为毫无用处了。
        if (rowData[column.dataKey!] != null) {
          const num = Number(rowData[column.dataKey!].value);
          if (isNaN(num)) {
            throw `Cannot convert ${rowData[column.dataKey!].value} to number`;
          }
          rowData[column.dataKey!].value = num;
          rowData[column.dataKey!].editing = false;
        }
      } catch (err) {
        ElNotification.error(`${err}`);
        return;
      }
    }
    emits("unsaved", true);
  };

  const onMouseDown = () => {
    selection.value.startRowIndex = rowIndex;
    selection.value.endRowIndex = rowIndex;
    selection.value.startColIndex = columnIndex;
    selection.value.endColIndex = columnIndex;
  };
  const mousemove = (evt: MouseEvent) => {
    if (evt.buttons == 1) {
      selection.value.endRowIndex = rowIndex;
      selection.value.endColIndex = columnIndex;
    }
  };
  const input = ref();
  const setRef = (el) => {
    input.value = el;
    if (el) {
      el.focus?.();
    }
  };

  const inSelection = () => {
    const rowLess = Math.min(
      selection.value.startRowIndex,
      selection.value.endRowIndex
    );
    const rowGreater = Math.max(
      selection.value.startRowIndex,
      selection.value.endRowIndex
    );
    const colGreater = Math.max(
      selection.value.startColIndex,
      selection.value.endColIndex
    );
    const colLess = Math.min(
      selection.value.startColIndex,
      selection.value.endColIndex
    );
    // console.log(
    //   [rowLess, rowGreater],
    //   [colLess, colGreater],
    //   columnIndex,
    //   rowIndex
    // );
    if (
      colLess <= columnIndex &&
      columnIndex <= colGreater &&
      rowLess <= rowIndex &&
      rowIndex <= rowGreater
    ) {
      return true;
    } else {
      return false;
    }
  };

  return rowData[column.dataKey].editing ? (
    <InputCell
      forwardRef={setRef}
      value={rowData[column.dataKey!].value}
      onChange={onChange}
      onBlur={onExitEditMode}
      enterPressed={onExitEditMode}
    />
  ) : (
    <div
      class={{
        "table-v2-inline-editing-trigger": true,
        "table-v2-selected": inSelection(),
      }}
      onClick={onEnterEditMode}
      onMousedown={onMouseDown}
      onMousemove={mousemove}
    >
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
};

const calcTableDataNew = () =>
  tableData.value.map((values, rowIndex) => {
    const val = columns.value.reduce(
      (rowData, column) => {
        rowData[column.dataKey] = {
          value: values[column.dataKey],
          editing: false,
        };
        return rowData;
      },
      {
      }
    );
    return val;
  });

const convertTableDataToJson = (table?: { [key: string]: any }[]) => {
  if (table == null) {
    table = tableDataNew.value;
  }
  const newData: { [key: string]: any }[] = [];
  for (const row of table) {
    const newRow: { [key: string]: any } = {};
    for (const key in row) {
      if (!key.startsWith("_") && row[key] != null) {
        newRow[key] = row[key].value;
      }
    }

    newData.push(newRow);
  }
  return newData;
};

const onTableToLatex = async (type: "all" | "selection") => {
  const table = type == "all" ? tableDataNew.value : await getSlice();
  const latex = await tableToLatex({ data: convertTableDataToJson(table) });
  await navigator.clipboard.writeText(latex);
  ElNotification.success("Latex content has been copied onto the clipboard!");
};

const getSlice = async () => {
  const rows = tableDataNew.value.slice(
    selection.value.startRowIndex,
    selection.value.endRowIndex + 1
  );
  const slicedCols = columns.value.slice(
    selection.value.startColIndex,
    selection.value.endColIndex + 1
  );
  const rowsSliced: { [key: string]: any }[] = [];
  for (const row of rows) {
    const newRow: { [key: string]: any } = {};
    for (const col of slicedCols) {
      newRow[col.dataKey] = row[col.dataKey];
    }
    rowsSliced.push(newRow);
  }
  return rowsSliced;
};

const onSaveCommand = () => {
  writeTableFile({
    path: props.path,
    data: convertTableDataToJson(),
    sheet: currentSheet.value,
  });
  emits("unsaved", false);
};

onBeforeUnmount(() => {
  unregisterOnSaveCommand(onSaveCommand);
});

registerOnSaveCommand(onSaveCommand);
</script>

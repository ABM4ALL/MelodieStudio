<template>
  <!-- <el-table
    :data="tableData"
    @scroll="handleScroll"
    height="100%"
    class="table-viewer-table"
  >
    <el-table-column type="index" :index="indexMethod" />
    <el-table-column
      :prop="col.name"
      :label="col.name"
      v-for="col in columns"
      :key="col.name"
      :width="60 + 10 * col.name.length"
    >
      <template #default="scope">
        <div style="display: flex; align-items: center">
          <el-icon><timer /></el-icon>
          <span style="margin-left: 10px"
            >{{ scope.row[col.name] }}: {{ scope.row.index }}</span
          >
        </div>
      </template>
    </el-table-column>
  </el-table> -->
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
</template>
<style>
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
import { ElInput, ElNotification } from "element-plus";
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
const Input = resolveDynamicComponent("ElInput") as typeof ElInput;
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
  cellRenderer?: ({ rowData, column }) => any;
};

const emits = defineEmits(["unsaved"]);
const columns = ref<ColumnType[]>([]);
const tableData = ref<{ [key: string]: number | string }[]>([]);

const tableDataNew = ref<any>([]);
const tableDataOriginal = { value: [] };
const indexMethod = (index: number) => {
  return index;
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
  const onKeyDown = (evt: KeyboardEvent): any => {
    if (evt.key == "Enter") {
      enterPressed(evt);
    }
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
    />
  );
};

onMounted(async () => {
  const data = await readTableFile({ path: props.path });
  console.log(data);
  const cols: ColumnType[] = [
    {
      key: "_index",
      dataKey: "_index",
      title: "",
      width: 150,
      type: "integer",
      cellRenderer: ({ rowData, column }) => {
        return (
          <div class="table-v2-inline-editing-trigger">
            <div> {rowData[column.dataKey!].value}</div>
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
      cellRenderer: ({ rowData, column }) => {
        const onChange = (value: string) => {
          rowData[column.dataKey!].value = value;
        };
        const onEnterEditMode = () => {
          rowData[column.dataKey!].editing = true;
        };

        const onExitEditMode = () => {
          if (column.type == "number") {
            try {
              const num = Number(rowData[column.dataKey!].value);
              if (isNaN(num)) {
                throw `Cannot convert ${
                  rowData[column.dataKey!].value
                } to number`;
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
          <div
            class="table-v2-inline-editing-trigger"
            onClick={onEnterEditMode}
          >
            <div> {rowData[column.dataKey!].value}</div>
          </div>
        );
      },
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
});

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
    for (const key in row) {
      if (!key.startsWith("_") && row[key] != null) {
        newRow[key] = row[key].value;
      }
    }
    newData.push(newRow);
  }
  return newData;
};

registerOnSaveCommand(() => {
  writeTableFile({ path: props.path, data: convertTableDataToJson() });
  emits("unsaved", false);
});
</script>

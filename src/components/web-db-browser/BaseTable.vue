<template>
    <div class="toolbar">
        <edit-panel :record-columns="columns" ref="editPanel" @record-value-change="onRecordEdit"
            :title="editingIndex < 0 ? '添加数据' : '编辑数据'"></edit-panel>
        <el-tooltip :content="$t('message.newRecord')">
            <el-button @click="addRecord">
                <el-icon>
                    <CirclePlusFilled />
                </el-icon>
            </el-button>
        </el-tooltip>
        <div style="flex-grow: 1;"></div>
        <div>{{ $t('message.itemCount') }}: {{ filterTableData.length }}</div>
    </div>

    <el-table :data="filterTableData" style="width: 100%; height: 90vh;"
        :cell-class-name="(obj) => obj.columnIndex < columns.length ? 'normal-cell' : 'util-cell'">
        <el-table-column align="right" :prop="column.name" :key="column.name" v-for="column of columns"
            :width="column.width !== 0 ? column.width : undefined"
            :min-width="column.width !== 0 ? column.width : undefined">
            <template #header>

                <div v-if="!((columnsFilterStatus[column.name]) && columnsFilterStatus[column.name].status)"
                    class="column-header">
                    <span class="name">{{ column.label || column.name }}</span>
                    <div class="spacer"></div>

                    <el-button text @click="modifyFilterStatus(column.name, true)" :icon="Filter"></el-button>
                </div>

                <div v-else class="column-header">
                    <span class="name">{{ column.label || column.name }}</span>
                    <el-input v-if="!column.selectable" v-model="columnsFilterStatus[column.name].text" size="small"
                        clearable :placeholder="$t('message.typeToSearch')" />
                    <el-autocomplete v-else v-model="columnsFilterStatus[column.name].text"
                        :fetch-suggestions="autocompleteFilter(column.name)" clearable
                        :placeholder="$t('message.typeToSearch')" size="small"
                        @select="columnsFilterStatus[column.name].text = ($event).value">
                        <template #default="{ item }">
                            <div style="display: flex;">
                                <div style="width: 48px;max-width: 48px;">{{ item.index }}</div>
                                <div class="value">{{ item.value }}</div>
                                <div style="flex-grow: 1;min-width: 24px;"></div>
                                <div>{{ $t('message.itemCount') }}:</div>
                                <div style="min-width: 48px;max-width: 48px;text-align: right;"> {{ item.count }}</div>
                            </div>

                        </template>
                    </el-autocomplete>
                    <el-button text @click="modifyFilterStatus(column.name, false)" :icon="Close"></el-button>
                </div>
            </template>
        </el-table-column>
        <el-table-column :width="160" :label="$t('message.operation')">
            <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.$index, scope.row)">{{ $t("message.edit")
                }}</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.row.$id)">{{ $t("message.delete")
                }}</el-button>
            </template>
        </el-table-column>
    </el-table>
    <!-- </div> -->
</template>
  
<script lang="ts" setup>
import { computed, ref, defineProps, PropType, watch, defineEmits, nextTick } from 'vue'
// import { Filter } from "element-plus"
import { Filter, Close, CirclePlusFilled } from '@element-plus/icons-vue'
import EditPanel from "./EditPanel.vue"
import { ColumnScheme } from "./models"
import { BasicDataTypes } from '../dynamicform/models';
const editPanel = ref<InstanceType<typeof EditPanel>>(null);
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus';
const { t } = useI18n()
interface User {
    date: string
    name: string
    address: string
}

const emits = defineEmits<{
    (e: "record-value-change", value: { $id: number, value: Record<string, any> }): void,
    (e: "record-new", value: Record<string, any>): void,
    (e: "record-delete", $id: number): void,
}>()
const props = defineProps({
    columns: { type: Object as PropType<ColumnScheme[]>, required: true },
    data: { type: Array as PropType<Record<string, any>>, required: true },
    tableName: { type: String, required: true }
})
const columnItemsCounter = ref<{ [key: string]: Record<string | number, number> }>({})
const columnsFilterStatus = ref<{ [key: string]: { status: boolean, text: string } }>({})

const modifyFilterStatus = (colName: string, status: boolean) => {
    if (columnsFilterStatus.value[colName] == null) {
        columnsFilterStatus.value[colName] = { status: false, text: "" }
    }
    columnsFilterStatus.value[colName].status = status
}
type TableFilter = (tableData: Record<string, any>) => boolean
const dataFilters = ref<TableFilter[]>([])

// const createAutocompleteFunc = ()=>{}

const autocompleteFilter = (colName: string) => {
    return (queryString: string, cb: any) => querySearch(queryString, cb, colName)
}
const querySearch = (queryString: string, cb: any, colName: string) => {
    const createFilter = (queryString: string) => {
        return (item: { value: string }) => {
            return (
                item.value.toLowerCase().includes(queryString.toLowerCase())
            )
        }
    }
    const colCount = columnItemsCounter.value[colName];
    console.log(colName, colCount)
    if (colCount == null) {
        cb([])
        return
    }
    const values: { index: number, count: number, value: string }[] = []
    let index = 0
    for (const propName in colCount) {
        index += 1
        values.push({ index, value: propName, count: colCount[propName] })
    }
    const results = queryString
        ? values.filter(createFilter(queryString))
        : values
    console.log(results)
    cb(results)
}


watch(columnsFilterStatus.value, () => {
    const conditionFactory = (colName: string, condition: string): TableFilter => {
        condition = condition.toLowerCase()
        return (tableData: Record<string, any>) => `${tableData[colName]}`.toLowerCase().includes(condition)
    }
    // type b = typeof conditionFactory("", "")
    dataFilters.value = []
    for (const colName in columnsFilterStatus.value) {
        const filterStatus = columnsFilterStatus.value[colName]
        if (filterStatus != null && filterStatus.status && filterStatus.text != "") {
            dataFilters.value.push(conditionFactory(colName, filterStatus.text.trim()))
        }
    }
})

const search = ref('')
const filterTableData = computed(() => {

    return props.data.filter(
        (data: Record<string, any>): boolean => {
            let result = true
            for (const filter of dataFilters.value) {
                result = result && filter(data)
                if (!result) {
                    return false
                }
            }
            return true
        }
    )
}
)

watch(() => filterTableData.value, () => {
    columnItemsCounter.value = {}

    for (const col of props.columns) {
        if (!col.selectable) {
            continue
        }
        if (columnItemsCounter.value[col.name] == null) {
            columnItemsCounter.value[col.name] = {}
        }

        for (const data of filterTableData.value) {
            if (columnItemsCounter.value[col.name][data[col.name]] == null) {
                columnItemsCounter.value[col.name][data[col.name]] = 0
            }
            columnItemsCounter.value[col.name][data[col.name]] += 1
        }
    }

    console.log(columnItemsCounter.value)
})

const editingIndex = ref(-1)
const handleEdit = async (index: number, row: any) => {
    if (row.$id == null) {
        ElNotification.error("Row id 未找到，发生内部错误")
        return
    }
    editPanel.value.show()
    await nextTick()

    editPanel.value.setData(row)
    // console.log(row.$id)

    editingIndex.value = row.$id
    console.log('setting editing index', editingIndex)
}
const handleDelete = ($id: number) => {
    // console.log(index, row)
    emits("record-delete", $id)
}

const defaultValue = (vtype: BasicDataTypes) => {
    return {
        'str': '',
        'int': 0,
        'float': 0.0,
        'bool': false
    }[vtype]
}

const addRecord = async () => {
    editPanel.value.show()
    await nextTick()
    if (props.data.length > 0) {
        editPanel.value.setData(props.data[0])
    } else {
        const record = {}
        for (const col of props.columns) {
            record[col.name] = defaultValue(col.type)
        }
        editPanel.value.setData(record)
    }

    editingIndex.value = -1
}

const onRecordEdit = (newValue) => {
    console.log(editingIndex.value)
    if (editingIndex.value >= 0) {
        emits("record-value-change", { $id: editingIndex.value, value: newValue })
    } else {
        emits("record-new", newValue)
    }
}


</script>
<style>
.normal-cell div {
    text-align: left;
}

.util-cell div {
    text-align: right;
}

.column-header .el-input {
    flex-grow: 1;
}

.column-header .el-autocomplete {
    flex-grow: 1;
}
</style>
<style lang="scss" scoped>
.toolbar {
    margin-top: 12px;
    display: flex;
    height: 12%;
}

.column-header {
    display: flex;
    flex-direction: row;
    align-items: center;

    .spacer {
        flex-grow: 1;
    }


    .name {
        text-align: center;
        min-width: 80px;
    }
}

.table-outer {
    width: calc(100% - 12%);
}
</style>
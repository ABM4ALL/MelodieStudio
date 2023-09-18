<template>
    <div class="safety-info-db-page">
        <div class="header">
            <el-button v-for="tableDesc of allTables" :key="tableDesc.name" @click="loadTable(tableDesc.name)"
                :type="tableName.value === tableDesc.name ? 'primary' : ''"> {{
                    tableDesc.label }}</el-button>
            <div class="spacer"></div>
            <el-button @click="onExportFile">{{ $t('message.exportFile') }}</el-button>
            <el-button @click="importFileDialogShow = true">{{ $t('message.importFile') }}</el-button>
        </div>

        <el-dialog v-model="importFileDialogShow">
            <el-upload class="upload-demo" drag :action="`/api/safety-info-db/importData?tableName=${tableName.value}`"
                multiple>
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    {{ $t('message.files.dropFileHere') + $t('message.comma') + $t('message.or') }}
                    <em>{{ $t('message.files.clickToUpload') }}</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        {{ $t('message.files.pleaseUpload') }}
                    </div>
                </template>
            </el-upload>
        </el-dialog>
        <base-table :columns="columns" :tableName="tableName.value" :data="tableData" @record-value-change="onRecordEdit"
            @record-new="onNewRecord" @record-delete="onDeleteRecord"></base-table>
    </div>
</template>
<script setup lang="ts">
import BaseTable from "./BaseTable.vue";
import { ColumnScheme, TableDesc } from "./models";
import { SafetyDBRequests } from "./requests"
import { onMounted, ref } from "vue"
import { deepCopy } from "@/utils/utils";
import { createStorageProxy } from "@/utils/localstorageproxy";
import { ElNotification } from "element-plus";
import { useI18n } from 'vue-i18n'
import { downloadFileNew } from "@/utils/file"
const { t } = useI18n()

const columns = ref<ColumnScheme[]>([])
const tableData = ref<Record<string, any>[]>([])
const importFileDialogShow = ref(false)
// const tableName = ref("safety_cases")
const tableName = ref(createStorageProxy('safetyinfodb-tableName', ''))
const allTables = ref<TableDesc[]>([])
let requests: null | SafetyDBRequests = null

/** $id is hidden property indicating the index of table. */
const updateData = (data: Record<string, any>[]) => {
    for (let i = 0; i < data.length; i++) {
        data[i].$id = i
        tableData.value.push(data[i])
    }
}
const updateID = (data: Record<string, any>[]) => {
    for (let i = 0; i < data.length; i++) {
        data[i].$id = i
    }
}


onMounted(async () => {
    allTables.value = await SafetyDBRequests.getAllTables()
    if (tableName.value.value != "") {
        loadTable(tableName.value.value)
    } else if (allTables.value.length > 0) {
        loadTable(allTables.value[0].name)
    }
})
const onNewRecord = async (newRecord) => {
    if (requests == null) {
        return
    }
    const dataCopy = deepCopy<typeof newRecord>(newRecord)
    delete dataCopy.$id
    try {
        const safetyCase = await requests.createSafetyInfo(dataCopy)
        console.log(safetyCase)
        // if(tableData.)
        // const lastID = tableData.value[tableData.value.length-1].$id
        tableData.value.push(safetyCase)
        updateID(tableData.value)
        ElNotification.success(t('message.addRecordSucc'))
    } catch (err) {
        ElNotification.error(`${err}`)
        console.error(err)
    }

}

const onDeleteRecord = async ($id: number) => {
    if (requests == null) {
        return
    }
    const record = tableData.value[$id]
    console.log(record)
    if (record != null) {
        await requests.deleteSafetyInfo(record)
        tableData.value = tableData.value.slice(0, $id).concat(tableData.value.slice($id + 1))
        updateID(tableData.value)
        ElNotification.success(t('message.delRecordSucc'))
    }
}

const loadTable = async (table: string) => {
    requests = new SafetyDBRequests(table)
    if (requests == null) {
        return
    }
    tableName.value.value = table
    tableData.value = []
    const schemas = await requests.getSchemas()
    columns.value = schemas.columns
    console.log(columns.value)
    const allSafetyInfo = await requests.getAllSafetyInfo()
    updateData(allSafetyInfo);

}

const onRecordEdit = (newValue) => {
    if (requests == null) {
        return
    }
    const { value, $id } = newValue
    const originalData = tableData.value[$id]
    for (const propName in value) {
        originalData[propName] = value[propName]
    }

    const dataCopy = deepCopy<typeof originalData>(originalData)
    delete dataCopy.$id

    requests.updateSafetyInfo(dataCopy).then(() => {
        ElNotification.success(t('message.updateRecordSucc'))
    }).catch((err) => {
        ElNotification.error(err)
        console.error(err)
    })
}

const onExportFile = () => {
    // console.log(tableName.value)
    downloadFileNew(`/api/safety-info-db/export_table?tableName=${tableName.value.value}`, tableName.value.value + ".csv")

    // downloadFile(new File())
    ElNotification.success(t('message.files.fileExportStartedInBrowser'))
}
</script>
<style lang="scss">
.safety-info-db-page {
    .header {
        display: flex;
        width: 100%;

        .spacer {
            flex-grow: 1;
        }
    }

}

.layout-container {
    overflow-y: auto !important;
}

.el-main {
    overflow: hidden;
}

.el-header {
    display: none;
}

.el-aside {
    display: none;
}
</style>
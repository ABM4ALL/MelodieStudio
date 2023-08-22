<template>
    <el-table :data="filterTableData" style="width: 100%">
        <el-table-column align="right" :prop="colName" :key="colName" v-for="colName of columns">
            <template #header>

                <div v-if="!((columnsFilterStatus[colName]) && columnsFilterStatus[colName].status)" class="column-header">
                    <span class="name">{{ colName }}</span>
                    <div class="spacer"></div>
                    <el-button text @click="modifyFilterStatus(colName, true)" :icon="Filter"></el-button>
                </div>

                <div v-else class="column-header">
                    <span class="name">{{ colName }}</span>
                    <el-input v-model="columnsFilterStatus[colName].text" size="small" clearable placeholder="Type to search" />
                    <el-button text @click="modifyFilterStatus(colName, false)" :icon="Close"></el-button>
                </div>
            </template>
        </el-table-column>
        <el-table-column align="right">
            <template #default="scope">
                <el-button size="small" @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
                <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">Delete</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>
  
<script lang="ts" setup>
import { computed, ref, defineProps, PropType, watch } from 'vue'
// import { Filter } from "element-plus"
import { Filter, Close } from '@element-plus/icons-vue'
interface User {
    date: string
    name: string
    address: string
}
const props = defineProps({
    columns: { type: Object as PropType<string[]>, required: true }
})
const columnsFilterStatus = ref<{ [key: string]: { status: boolean, text: string } }>({})

const modifyFilterStatus = (colName: string, status: boolean) => {
    console.log(colName, status)
    if (columnsFilterStatus.value[colName] == null) {
        columnsFilterStatus.value[colName] = { status: false, text: "" }
    }
    columnsFilterStatus.value[colName].status = status
}
type TableFilter = (tableData: Record<string, any>) => boolean
const dataFilters = ref<TableFilter[]>([])
watch(columnsFilterStatus.value, () => {
    const conditionFactory = (colName: string, condition: string): TableFilter => {
        return (tableData: Record<string, any>) => tableData[colName].includes(condition)
    }
    // type b = typeof conditionFactory("", "")
    dataFilters.value = []
    for (const colName in columnsFilterStatus.value) {
        const filterStatus = columnsFilterStatus.value[colName]
        if (filterStatus != null && filterStatus.status && filterStatus.text != "") {
            dataFilters.value.push(conditionFactory(colName, filterStatus.text.trim()))
        }
    }
    console.log(dataFilters)
})

const search = ref('')
const filterTableData = computed(() => {
    return tableData.filter(
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
const handleEdit = (index: number, row: User) => {
    console.log(index, row)
}
const handleDelete = (index: number, row: User) => {
    console.log(index, row)
}

const tableData: User[] = [
    {
        date: '2016-05-03',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-02',
        name: 'John',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-04',
        name: 'Morgan',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-01',
        name: 'Jessy',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-01',
        name: 'Jessica',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-03',
        name: 'Jessica',
        address: 'No. 189, Grove St, Los Angeles',
    },
]
</script>
  
<style lang="scss" scoped>
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
</style>
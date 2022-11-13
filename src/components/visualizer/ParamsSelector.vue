<style scoped>
.popover-buttonlist {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
}

.popover-buttonlist :deep(.el-button){
    margin-left: 0px!important;
    width: 200px;
}
</style>
<template>
    <div>
        <el-popover trigger="click" width="240">
            <template #reference>
                <el-button>Parameter...</el-button>
            </template>
            <div class="popover-buttonlist">
                <el-button @click="onSaveParams">Save as..</el-button>
                <el-button @click="loadParamSetDialogShow = true">Load params...</el-button>
                <el-button @click="onSaveData">Save simulation data as...</el-button>
                <el-button @click="onDownloadDatabase">Export simulation data</el-button>
            </div>
        </el-popover>

    </div>
    <el-dialog v-model="loadParamSetDialogShow" :append-to-body="true">
        <div>
            <div v-for="paramSetName in paramSets" :key="paramSetName">
                <span> {{ paramSetName }}</span>
                <el-button @click="onLoadParams(paramSetName)"></el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, PropType, ref } from "vue"
import { ElMessageBox, ElNotification } from "element-plus";

const emits = defineEmits(["save-params", "load-params", "save-database", "export-database"])
const loadParamSetDialogShow = ref(false)
defineProps({
    paramSets: Array as PropType<string[]>,
    // type:
})
// 页面加载的时候，需要一并加载。
// Send: request to change params-set
// On: params changed. Use Init params method.
// Send: request to save params
// On: params saved, show message.
const onSaveParams = async () => {
    try {
        const { value: newName } = await ElMessageBox.prompt("Please input the name of param set", "Save param set",)
        emits("save-params", newName)
    } catch (err) {
        ElNotification.error("Failed to save param set, error:" + err)
    }

}

const onLoadParams = async (paramSetName: string) => {
    emits("load-params", paramSetName)
}

const onSaveData = async () => {
    try {
        const { value: newName } = await ElMessageBox.prompt("Please input the name of saved database", "Save simulation data as...",)
        emits("save-database", newName)
    } catch (err) {
        ElNotification.error("Failed to save param set, error:" + err)
    }
}

const onDownloadDatabase = async () => {
    try {
        const { value: newName } = await ElMessageBox.prompt("Please input the name of exported database", "Export simulation data as...",)
        emits("export-database", newName)
    } catch (err) {
        ElNotification.error("Failed to export database, error:" + err)
    }
}
</script>
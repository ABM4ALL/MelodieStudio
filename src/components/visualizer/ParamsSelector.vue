<style scoped>
.popover-buttonlist {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
}

.popover-buttonlist :deep(.el-button) {
    margin-left: 0px !important;
    width: 200px;
}
</style>
<style>
.load-param-dlg .el-dialog__body {
    overflow-y: auto;
    height: 50vh;
}
</style>
<template>
    <!-- <div> -->
    <el-popover trigger="click" width="160">
        <template #reference>
            <el-button>Scenario...</el-button>
        </template>
        <div class="popover-buttonlist">
            <el-button @click="onSaveParams">Save</el-button>
            <el-button @click="loadParamSetDialogShow = true">Load</el-button>

            <el-button @click="onActionClick(action.key, action)" v-for="action of actions" :key="action.key">{{
                action.text
            }}</el-button>
        </div>
    </el-popover>

    <!-- </div> -->
    <el-dialog v-model="loadParamSetDialogShow" :append-to-body="true" width="30vw" custom-class="load-param-dlg">
        <div v-for="paramSetName in paramSets" :key="paramSetName" style="display: flex; margin-top: 12px">
            <span> {{ paramSetName }}</span>
            <div style="flex-grow: 1"></div>
            <el-button @click="onLoadParams(paramSetName)" type="primary">Load</el-button>
        </div>
    </el-dialog>
    <el-dialog v-model="actionWithParamsConfigShow" :append-to-body="true" width="30vw">
        <dynamic-form ref="dynamicForm" :show-modified-warning="false"></dynamic-form>
        <template #footer>
            <el-button @click="actionWithParamsConfigShow = false">Cancel</el-button>
            <el-button type="primary" @click="triggerActionWithCustomArgs">Confirm</el-button>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, PropType, ref, nextTick } from "vue"
import { ElMessageBox, ElNotification } from "element-plus";
import { Action } from "@/models/visualizerbasics";
import axios from "axios";
import { downloadFile } from "@/utils/file";
import DynamicForm from "../dynamicform/DynamicForm.vue";
import { OperationEvaluator } from "@/service/operation_evaluator/opeval"
const emits = defineEmits(["save-params", "load-params", "save-database", "export-database"])
const loadParamSetDialogShow = ref(false)
const actionWithParamsConfigShow = ref(false)
const dynamicForm = ref(null)
const currentAction = ref<{ action: null | Action, key: string }>({ action: null, key: "" })
const props = defineProps({
    paramSets: Array as PropType<string[]>,
    actions: Array as PropType<Action[]>,
    wsHost: String
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

const newAxios = axios.create()
const onActionClick = async (key: string, action: Action) => {
    // console.log(action.custom_args)
    if (action.custom_args.length == 0) {
        emitAction(key, action)
    } else {
        actionWithParamsConfigShow.value = true
        await nextTick();
        currentAction.value = { key, action }
        console.log(dynamicForm.value);
        (dynamicForm.value as any).setupModels(action.custom_args);
        (dynamicForm.value as any).setupValues(action.custom_args)
    }
}

const triggerActionWithCustomArgs = () => {
    const values: { name: string, value: any }[] = (dynamicForm.value as any).getValues()
    if (currentAction.value.action == null) {
        throw Error
    }
    emitAction(currentAction.value.key, currentAction.value.action, values)
    currentAction.value = { action: null, key: '' }
    actionWithParamsConfigShow.value = false
}

const emitAction = (key: string, action: Action, args?: any[]) => {
    const argsSection = args ? "?args=" + JSON.stringify(args) : ""
    const url = `http://${props.wsHost}/action/` + key + argsSection

    newAxios.get(encodeURI(url), { responseType: 'blob' }).then((resp) => {
        try {
            const evaluator = new OperationEvaluator()
            evaluator.evaluate(resp, action.operation)
        } catch (err) {
            console.error(err)
        }
    }).catch((err) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const content = reader.result;//内容就在这里
            ElNotification.error(`${content}`)
        };
        reader.readAsText(err.response.data)
        console.error(err)
    })
}

</script>
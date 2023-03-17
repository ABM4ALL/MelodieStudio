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
    <el-popover trigger="click" width="160" v-for="(menu, menuName) in menuRoots" :key="menuName">
        <template #reference>
            <el-button>{{ menuName }}</el-button>
        </template>
        <div class="popover-buttonlist">

            <template v-for="(menuItem, menuName) of menu" :key="menuName">

                <parameterized-chart-window :ws-host="wsHost" :action="menuItem.action!"
                    v-if="menuItem.action != null && menuItem.action.type == 'parameterized-window'"></parameterized-chart-window>
                <el-button @click="menuItem.callback" v-else>{{
                    menuItem.text
                }}</el-button>
            </template>

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
    <el-dialog v-model="actionWithParamsConfigShow" :append-to-body="true" width="30vw" :title="actionParamDialogTitle">
        <dynamic-form ref="dynamicForm" :show-modified-warning="false"></dynamic-form>
        <template #footer>
            <el-button @click="actionWithParamsConfigShow = false">Cancel</el-button>
            <el-button type="primary" @click="triggerActionWithCustomArgs">Confirm</el-button>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, PropType, ref, nextTick, computed } from "vue"
import { ElMessageBox, ElNotification } from "element-plus";
import { Action } from "@/models/visualizerbasics";
import axios from "axios";
import { downloadFile } from "@/utils/file";
import DynamicForm from "../dynamicform/DynamicForm.vue";
import { OperationEvaluator } from "@/service/operation_evaluator/opeval"
import { Base64 } from 'js-base64';
import ParameterizedChartWindow from "./ParameterizedChartWindow.vue";
const emits = defineEmits(["save-params", "load-params", "save-database", "export-database"])
const loadParamSetDialogShow = ref(false)
const actionWithParamsConfigShow = ref(false)
const actionParamDialogTitle = ref('')
const dynamicForm = ref(null)
const currentAction = ref<{ action: null | Action, key: string }>({ action: null, key: "" })
const props = defineProps({
    paramSets: Array as PropType<string[]>,
    actions: Array as PropType<Action[]>,
    wsHost: String
    // type:
})

type Menus = { [key: string]: { [key: string]: { text: string, callback: () => void, action: Action | null } } }
const defaultMenus: Menus = {
    "Scenarios":
    {

        "Load": { text: "Load", callback: () => { loadParamSetDialogShow.value = true }, action: null },
        "Save": { text: "Save", callback: () => { onSaveParams() }, action: null }
    }
}
const menuRoots = computed((): Menus => {

    if (props.actions == null) {
        return defaultMenus
    }
    const menus: Menus = { "Scenarios": defaultMenus['Scenarios'] }

    for (const action of props.actions) {
        const menuName = action.menu || "Actions"
        if (menus[menuName] == null) {
            menus[menuName] = {} //as { [key: string]: () => void }
        }
        menus[menuName][action.key] = {
            text: action.text,
            callback: () => { onActionClick(action.key, action) },
            action
        }
    }
    return menus
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
    if (!action.fetch_custom_args) {
        emitAction(key, action)
    } else {
        actionWithParamsConfigShow.value = true
        actionParamDialogTitle.value = `Parameters of "${action.text}"`
        await nextTick();
        currentAction.value = { key, action }
        console.log(dynamicForm.value);
        const url = `/visualizer/action-params/` + key;

        newAxios.get(encodeURI(url)).then((resp) => {
            console.log('resp', resp.data);
            (dynamicForm.value as any).setupModels(resp.data.data);
            (dynamicForm.value as any).setupValues(resp.data.data);
        }).catch((err) => {
            ElNotification.error(`Fetching action parameters for action ${key} error.`)
            console.error(err)
        });

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
    const argsSection = args ? "?args=" + Base64.encode(JSON.stringify(args)) : ""
    const url = `/visualizer/action/` + key + argsSection

    newAxios.get(encodeURI(url), { responseType: 'blob' }).then((resp) => {
        try {
            const evaluator = new OperationEvaluator()
            evaluator.evaluate(resp, action.operation)
        } catch (err) {
            console.error(err)
        }
    }).catch((err) => {
        console.error(err)
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
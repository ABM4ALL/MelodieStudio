<template>
    <el-dialog v-model="showAgentsTimeSeriesView" width="80vw" :append-to-body="true" :title="dlgWindow.title">
        <dynamic-form ref="dynamicForm" :show-modified-warning="false"></dynamic-form>
        <el-button @click="draw" type="primary" style="margin-top: 12px;">Draw or Update Charts</el-button>
        <free-e-chart-component ref="charts" v-for="index of chartNum" :key="index"
            style="height: 30vh; width: 100%;"></free-e-chart-component>
    </el-dialog>
    <el-button @click="showWindow">{{ action.text }}</el-button>
</template>

<script setup lang="ts">
import { ref, defineProps, nextTick, PropType } from "vue"
import { setOnShowChartWindow } from "../events/globalevents";
import DynamicForm from "../dynamicform/DynamicForm.vue";
import FreeEChartComponent from "../dynamicChart/FreeEChartComponent.vue";
import axios from "axios";
import { Action } from "@/models/visualizerbasics";
import { ElNotification } from "element-plus";
import { Base64 } from "js-base64";
const dynamicForm = ref(null)
const props = defineProps({
    wsHost: {
        type: String,
        required: true
    },
    action: {
        type: Object as PropType<Action>,
        required: true
    }
})

const showAgentsTimeSeriesView = ref(false)
const dlgWindow = ref({ title: "Chart" })
const charts = ref(null)
const chartNum = ref(1)
const newAxios = axios.create()
const showWindow = async () => {

    const url = `/visualizer/action-params/` + props.action.key;
    showAgentsTimeSeriesView.value = true
    await nextTick()
    newAxios.get(encodeURI(url)).then((resp) => {
        console.log('resp', resp.data);
        (dynamicForm.value as any).setupModels(resp.data.data);
        (dynamicForm.value as any).setupValues(resp.data.data);
    }).catch((err) => {
        ElNotification.error(`Fetching action parameters for action ${props.action.key} error.`)
        console.error(err)
    });
}

const draw = async () => {
    const args: { name: string, value: any }[] = (dynamicForm.value as any).getValues()
    const argsSection = args ? "?args=" + Base64.encode(JSON.stringify(args)) : ""
    const url = `/visualizer/action/` + props.action.key + argsSection

    newAxios.get(encodeURI(url)).then((resp) => {
        try {
            const data = resp.data.data
            console.log(data)
            onShowChartRequest(data)
        } catch (err) {
            console.error(err)
        }
    }).catch((err) => {
        console.error(err)
    })
}

const onShowChartRequest = async (options: { chartOptions: any[], window: { title: string } }) => {

    showAgentsTimeSeriesView.value = true
    chartNum.value = options.chartOptions.length
    dlgWindow.value = options.window
    await nextTick();

    if (charts.value == null) {
        return
    }
    for (let i = 0; i < chartNum.value; i++) {
        const chart = charts.value[i];
        (chart as any).setOption(options.chartOptions[i])
    }
}

setOnShowChartWindow((options: any) => {
    onShowChartRequest(options)
})
</script>
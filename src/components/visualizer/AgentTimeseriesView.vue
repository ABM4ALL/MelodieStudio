<template>
    <el-dialog v-model="showAgentsTimeSeriesView" width="80vw" :append-to-body="true" :title="dlgWindow.title">
        <div :id="chartDOMID" style="width:100%; height: 50vh;"></div>
    </el-dialog>
    <div style="display: inline-block;">
    </div>
</template>

<script setup lang="ts">
import request from "@/request";
import * as echarts from "echarts"
import { ref, defineProps, nextTick } from "vue"
import { setOnShowChartWindow } from "../events/globalevents";
const props = defineProps({
    wsHost: {
        type: String,
        required: true
    }
})
let chart: echarts.EChartsType | null = null
const chartDOMID = 'agent-timeseries-view'
const showAgentsTimeSeriesView = ref(false)
const dlgWindow = ref({ title: "Chart" })


const onShowChartRequest = async (options: { chartOptions: any, window: { title: string } }) => {

    showAgentsTimeSeriesView.value = true
    // return
    await nextTick();
    if (chart == null) {
        chart = echarts.init(
            document.getElementById(chartDOMID) as any
        );
    }
    dlgWindow.value = options.window
    chart.clear()
    chart.setOption(options.chartOptions)
    chart.setOption({
        grid: {
            right: "3%"
        },
        toolbox: {
            show: true,
            feature: {
                dataView: { readOnly: false },
                dataZoom: {},
                saveAsImage: {}
            }
        }
    })
}

setOnShowChartWindow((options: any) => {
    onShowChartRequest(options)
})
</script>
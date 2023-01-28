<template>
    <el-dialog v-model="showAgentsTimeSeriesView" width="80vw" :append-to-body="true">
        <div :id="chartDOMID" style="width:75vw; height: 50vh;"></div>
    </el-dialog>
    <div style="display: inline-block;">
        <!-- <el-button @click="showDialog">Get Agent Timeseries Data</el-button> -->
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

async function getAgentTimeSeriesData(containerName: string, agentID: number): Promise<{ [key: string]: any }[]> {
    const resp = await request.get(`http://${props.wsHost}/inspect/datacollector/timeseries/agent?id=${agentID}&container=${containerName}`)
    if (resp.data == null) {
        console.error(resp)
        throw Error
    } else {
        return resp.data
    }
}

const showDialog = async () => {

    showAgentsTimeSeriesView.value = true
    // return
    await nextTick();
    if (chart == null) {
        chart = echarts.init(
            document.getElementById(chartDOMID) as any
        );
    }
    const data = await getAgentTimeSeriesData('agents', 1)
    const xAxisData: number[] = []
    const yAxisData: number[] = []
    for (const item of data) {
        xAxisData.push(item['period'])
        yAxisData.push(item['cash'])
    }
    const options = {

        xAxis: {
            type: 'value',
            data: xAxisData
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: yAxisData,
                type: 'line'
            }
        ]
    };
    chart?.setOption(options)
}

const onShowChartRequest = async (options: any) => {

    showAgentsTimeSeriesView.value = true
    // return
    await nextTick();
    if (chart == null) {
        chart = echarts.init(
            document.getElementById(chartDOMID) as any
        );
    }
    chart.clear()
    chart.setOption(options)
    chart.setOption({
        toolbox: {
            show: true,
            feature: {
                dataView: { readOnly: false },
                dataZoom: {},
                // magicType: { type: ['line', 'bar'] },
                // restore: {},
                saveAsImage: {}
            }
        }
    })
}

setOnShowChartWindow((options: any) => {
    onShowChartRequest(options)
})
</script>
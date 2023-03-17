<template>
    <div :id="chartDOMID"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts"
import { v4 as uuid } from "uuid";
import { ref, defineExpose, onBeforeMount } from "vue"

let chart: echarts.EChartsType | null = null
const chartDOMID = ref("")

onBeforeMount(() => {
    chartDOMID.value = "echart-free-component-" + uuid();
})

function setOption(options: echarts.EChartsOption) {
    if (chart == null) {
        chart = echarts.init(
            document.getElementById(chartDOMID.value) as any
        );
    }
    chart.clear()
    console.log("option", chartDOMID.value, options)
    chart.setOption(options)
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

defineExpose({ setOption })
</script>
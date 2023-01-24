<style >
.linechartIncremental {
    position: absolute;
    width: 500px;
    height: 300px;
}

.linechartIncremental .el-drawer__body {
    overflow: auto;
}
</style>
<template>
    <drag-container class="linechartIncremental" @container-changed="onLayoutChanged"
        :slotComponentID="'chart-' + chartName">
        <chart-config @config-modified="onChartConfigModified" @delete-saved-option="onOptionDelete"
            @drawer-close="configDialogShow = false" :initialOptions="chartOption" :selectionItems="selectionItems"
            :unchangeableItems="unchangeableItems" :showDrawer="configDialogShow" :chartName="chartName"></chart-config>

        <div :id="chartDOMID" :style="{ width: '100%', height: '100%' }"></div>
    </drag-container>
</template>

<script lang="ts">
import ChartConfig from "./ChartConfig.vue";
import { defineComponent } from "vue";
import {
    CHART_TYPES,
} from "./chartutils";
import { createBarChartDefaultData} from "./defaultoptions";
import * as echarts from "echarts";

import {
    deleteChartOptions,
} from "@/api/chart";
import DragContainer from "@/components/basic/DragContainer.vue";
import BaseChart from "./BaseChart.vue"

export default defineComponent({
    extends: BaseChart,
    components: { ChartConfig, DragContainer },
    data() {
        const defaultOptions = createBarChartDefaultData() as echarts.EChartsOption;
        return {
            type: CHART_TYPES.BAR_CHART,
            simulationData: {

            } as {
                xAxis: {
                    type: 'category',
                    data: string[],
                    axisTick: {
                        alignWithLabel: boolean
                    }
                }[]
                ,
                series: { name: 'Direct', type: 'bar', data: number[] }[]
            },
            chartOption: defaultOptions as echarts.EChartsOption
        };
    },
    methods: {
        async onOptionDelete(): Promise<void> {
            await deleteChartOptions(this.chartName);

            const defaultOptions = createBarChartDefaultData();
            this.chartOption = defaultOptions as echarts.EChartsOption;
            this.$chart.setOption(this.chartOption);
            this.$chart.setOption(this.simulationData);
        },
        async addData(
            step: number,
            values: { name: string; value: number }[]
        ): Promise<void> {
            const xLabels: string[] = []
            const barValues: number[] = []
            for (const item of values) {
                xLabels.push(item.name)
                barValues.push(item.value)
            }
            this.simulationData = {
                xAxis: [
                    {
                        type: 'category',
                        data: xLabels,
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                series: [{ name: 'Direct', type: 'bar', data: barValues as any }]
            }
            this.needsRender = true;
            this.currentStep += 1;
        },
        clear() {
            for (let i in this.simulationData.series) {
                this.simulationData.series[i].data = [];
            }
            this.currentStep = 0;
            this.needsRender = true;
        },
    },
});
</script>



<template>
  <el-row v-for="(seriesConf, key) in seriesConfig" :key="key">
    <incremental-line-chart :externalConfig="config" :chartName="key" :ref="key" :seriesConfig="seriesConf.series"
      v-if="seriesConf.type == 'line'">
    </incremental-line-chart>
    <pie-chart :chartName="key" :ref="key" :seriesConfig="seriesConf.series" v-if="seriesConf.type == 'pie'">

    </pie-chart>
    <bar-chart :chartName="key" :ref="key" :seriesConfig="seriesConf.series" v-if="seriesConf.type == 'bar'"></bar-chart>
    <candle-stick-chart :chartName="key" :ref="key" :seriesConfig="seriesConf.series" v-if="seriesConf.type == 'candlestick'"></candle-stick-chart>
  </el-row>
</template>

<script lang="ts">
import IncrementalLineChart from "@/components/dynamicChart/IncrementalLineChart.vue";
import PieChart from "@/components/dynamicChart/PieChart.vue"
import BarChart from "@/components/dynamicChart/BarChart.vue"
import CandleStickChart from "@/components/dynamicChart/CandleStickChart.vue"
import { defineComponent, PropType } from "@vue/runtime-core";
import { SeriesConfig, IncrementalData } from "./chartutils";
export default defineComponent({
  components: { IncrementalLineChart, PieChart, BarChart, CandleStickChart },
  props: {
    seriesConfig: {
      type: Object as PropType<SeriesConfig[]>,
      required: true,
    },
  },
  data() {
    return {
      config: undefined as any | undefined,
      configSelectionItems: {
        "root-tooltip-trigger": ["axis", "item", "none"],
        "root-legend-orient": ["vertical", "horizontal"],
        "root-xAxis-type": ["value", "category", "time", "log"],
        "root-yAxis-type": ["value", "category", "time", "log"],

        "root-series-*-lineStyle-type": ["solid", "dashed", "dotted"],
        "root-series-*-itemStyle-borderType": ["solid", "dashed", "dotted"],
        "root-series-*-symbol": [
          "circle",
          "rect",
          "roundRect",
          "triangle",
          "diamond",
          "pin",
          "arrow",
          "none",
        ],
      },
      configUnchangeableItems: {
        "root-series-*-data": false,
        "root-series-*-name": false,
      },
      timer: null as number | null,
    };
  },
  methods: {
    onChartConfigModified(config: any): void {
      this.config = config;
    },

    addData(step: number, data: IncrementalData[]): void {
      for (let i = 0; i < data.length; i++) {
        const chartName = data[i].chartName;
        const chart = (this.$refs[chartName] as any)[0];
        const series = data[i].series;
        if (chart == null) {
          console.error(
            `chart "${chartName}" undefined! the series config was:`,
            this.seriesConfig
          );
          return;
        }
        if (series == null) {
          console.error("series undefined!");
          return;
        }
        chart.addData(step, series);
      }
    },
    reset() {
      for (let chartName in this.seriesConfig) {
        const chart = (this.$refs[chartName] as any)[0];
        if (chart != null) {
          chart.clear();
        }
      }
    },
  },
});
</script>

<style>

</style>
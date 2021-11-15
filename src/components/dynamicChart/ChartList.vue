<template>
  <el-row>
    <incremental-line-chart
      :externalConfig="config"
      @initialized="onChartInitialized"
      v-for="(seriesConf, key) in seriesConfig"
      :key="key"
      :chartName="key"
      :ref="key"
      :seriesConfig="seriesConf"
    ></incremental-line-chart>
  </el-row>
</template>

<script lang="ts">
import IncrementalLineChart from "@/components/dynamicChart/IncrementalLineChart.vue";
import { defineComponent, PropType } from "@vue/runtime-core";
import { number } from "echarts";
import { SeriesConfig, IncrementalData } from "./chartutils";
export default defineComponent({
  components: { IncrementalLineChart },
  props: {
    seriesConfig: {
      type: Object as PropType<SeriesConfig>,
      required: true,
    },
  },
  data() {
    const indexCache: { [key: string]: { [key: string]: number } } = {};
    for (let chartName in this.seriesConfig) {
      indexCache[chartName] = {};
      for (let i = 0; i < this.seriesConfig[chartName].length; i++) {
        const seriesName = this.seriesConfig[chartName][i].seriesName;
        indexCache[chartName][seriesName] = i;
      }
    }
    console.log(indexCache);
    return {
      indexCache: indexCache,
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
    onChartInitialized(chartName: string): void {
      console.log("chart", chartName, "initialized!");
    },
    addData(step: number, data: IncrementalData[]): void {
      console.log(step, data);
      for (let i = 0; i < data.length; i++) {
        const chartName = data[i].chartName;
        const chart = this.$refs[chartName] as typeof IncrementalLineChart;
        const series = data[i].series;
        console.log(i, chartName, this.$refs);
        if (chart === undefined) {
          console.error("chart undefined!");
          return;
        }
        if (series === undefined) {
          console.error("series undefined!");
          return;
        }

        const seriesData: number[] = [];
        for (let i = 0; i < series.length; i++) {
          seriesData.push(0);
        }
        for (let j in series) {
          const seriesName = series[j].name;
          const seriesIndex = this.indexCache[chartName][seriesName];
          seriesData[seriesIndex] = series[j].value;
        }
        chart.addData(chart.currentStep, seriesData);
      }
    },
  },
});
</script>

<style>
</style>
<template>
  <el-row>
    <incremental-line-chart
      :externalConfig="config"
      v-for="(seriesConf, key) in seriesConfig"
      :key="key"
      :chartName="key"
      :ref="key"
      :seriesConfig="seriesConf.series"
    ></incremental-line-chart>
  </el-row>
</template>

<script lang="ts">
import IncrementalLineChart from "@/components/dynamicChart/IncrementalLineChart.vue";
import { defineComponent, PropType } from "@vue/runtime-core";
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
        const chart = this.$refs[chartName] as typeof IncrementalLineChart;
        const series = data[i].series;
        if (chart === undefined) {
          console.error(
            `chart "${chartName}" undefined! the series config was:`,
            this.seriesConfig
          );
          return;
        }
        if (series === undefined) {
          console.error("series undefined!");
          return;
        }

        chart.addData(step, series);
      }
    },
    reset() {
      for (let chartName in this.seriesConfig) {
        (this.$refs[chartName] as any).clear();
      }
    },
  },
});
</script>

<style>
</style>
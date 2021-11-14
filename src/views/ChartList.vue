<template>
  <div style="width: 400px">
    <incremental-line-chart
      :externalConfig="config"
      :selectionItems="configSelectionItems"
      :unchangeableItems="configUnchangeableItems"
      :seriesNames="['series1', 'series2']"
      ref="lineChart"
      @initialized="onChartInitialized"
    ></incremental-line-chart>
  </div>
</template>

<script lang="ts">
import IncrementalLineChart from "@/components/dynamicChart/IncrementalLineChart.vue";
import { defineComponent } from "@vue/runtime-core";
export default defineComponent({
  components: { IncrementalLineChart },
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
    };
  },
  methods: {
    onChartConfigModified(config: any): void {
      this.config = config;
    },
    onChartInitialized(): void {
      console.log("initialized!");
      window.setTimeout(() => {
        const chart = this.$refs["lineChart"] as any;
        for (let i = 0; i < 10; i++) {
          chart.addData(chart.currentStep, [Math.random(), Math.random()]);
        }
      }, 1000);
    },
  },
  // mounted() {},
});
</script>

<style>
</style>
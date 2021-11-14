<template>
  <div style="width: 400px">
    <incremental-line-chart
      :externalConfig="config"
      :seriesNames="['series1', 'series2']"
      :chartName="'mychart1'"
      ref="mychart1"
      @initialized="onChartInitialized"
    ></incremental-line-chart>
    <!-- <incremental-line-chart
      :externalConfig="config"
      :seriesNames="['series1', 'series2', 'series3']"
      :chartName="'mychart2'"
      ref="mychart2"
      @initialized="onChartInitialized"
    ></incremental-line-chart> -->
    <incremental-line-chart
      :externalConfig="config"
      :seriesNames="['series4', 'series5', 'series6']"
      :chartName="'mychart2'"
      ref="mychart2"
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
      timer: null as number | null,
    };
  },
  methods: {
    onChartConfigModified(config: any): void {
      this.config = config;
    },
    onChartInitialized(chartName: string): void {
      console.log("initialized!");

      const chart = this.$refs[chartName] as any;
      if (chartName === "mychart1") {
        for (let i = 0; i < 10; i++) {
          chart.addData(chart.currentStep, [Math.random(), Math.random()]);
        }
      } else {
        for (let i = 0; i < 20; i++) {
          chart.addData(chart.currentStep, [
            Math.random(),
            Math.random(),
            Math.random(),
          ]);
        }
      }
    },
    onStep(chartName: string): void {
      const chart = this.$refs[chartName] as any;
      if (chartName === "mychart1") {
        chart.addData(chart.currentStep, [Math.random(), Math.random()]);
      } else {
        chart.addData(chart.currentStep, [
          Math.random(),
          Math.random(),
          Math.random(),
        ]);
      }
    },
  },
  mounted() {
    this.timer = window.setInterval(() => {
      this.onStep("mychart1");
      this.onStep("mychart2");
    }, 2000);
  },
  beforeUnmount() {
    if (this.timer === null) {
      return;
    }
    window.clearInterval(this.timer);
  },
});
</script>

<style>
</style>
<template>
  <chart-list :seriesConfig="d" ref="chartList"></chart-list>
</template>

<script lang="ts">
import ChartList from "@/components/dynamicChart/ChartList.vue";
import {
  IncrementalData,
  SeriesConfig,
} from "@/components/dynamicChart/chartutils";
import { defineComponent } from "@vue/runtime-core";
export default defineComponent({
  components: { ChartList },
  data() {
    return {
      step: 0,
      timer: null as null | number,
      d: {
        mychart1: [{ seriesName: "series1" }, { seriesName: "series2" }],
        mychart2: [
          { seriesName: "series3" },
          { seriesName: "series4" },
          { seriesName: "series5" },
        ],
      } as SeriesConfig,
    };
  },
  methods: {
    onStep() {
      const chartList = this.$refs["chartList"] as any;
      const incrData: IncrementalData[] = [
        {
          chartName: "mychart1",
          series: [
            { name: "series1", value: Math.random() },
            { name: "series2", value: Math.random() },
          ],
        },
      ];
      chartList.addData(this.step, incrData);
      // console.log("chart data added!");
      this.step += 1;
    },
  },
  mounted() {
    this.timer = window.setInterval(() => {
      this.onStep();
    }, 1000);
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
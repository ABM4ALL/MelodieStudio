<template>
  <div :id="chartDOMID" :style="{ width: '400', height: '300px' }"></div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { nanoid, random } from "nanoid";
import * as echarts from "echarts";
import "echarts-gl";

interface LineChartSeriesOption extends echarts.LineSeriesOption {
  data: Array<Array<number>>;
}

export default defineComponent({
  name: "IncrementalLineChart",
  props: {
    immediateRender: {
      default: false,
    },
  },
  data() {
    return {
      chartDOMID: nanoid(),
      simulationData: [] as Array<LineChartSeriesOption>,
      timer: undefined as number | undefined,
      needsRender: false,
    };
  },
  mounted() {
    this.initChart();
    this.timer = window.setInterval(() => {
      if (this.needsRender && !this.immediateRender) {
        this.renderChart();
      }
    }, 1000);
    const option = {
      title: {
        text: "Line Chart",
        subtext: "Fake Data",
      },
      xAxis: {
        type: "value",
      },
      yAxis: {
        type: "value",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      series: [],
    };
    this.$chart.setOption(option);

    this.simulationData = [
      { data: [], type: "line", smooth: true, showSymbol: false },
      { data: [], type: "line", smooth: true, showSymbol: false },
    ];
    for (let i = 0; i < 50; i++) {
      this.addData(i, [Math.random(), Math.random()]);
    }
    if (this.immediateRender) {
      this.renderChart();
    }
  },
  methods: {
    async addData(step: number, values: Array<number>): Promise<void> {
      for (let i = 0; i < values.length; i++) {
        this.simulationData[i].data.push([step, values[i]]);
      }
      this.needsRender = true;
    },
    renderChart() {
      this.$chart.setOption({
        series: this.simulationData,
      });
    },
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(
        document.getElementById(this.chartDOMID) as any
      );
      // 绘制图表
      // this.$chart.setOption(this.option as any);
    },
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
});
</script>

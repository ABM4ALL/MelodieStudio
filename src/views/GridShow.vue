<template>
  <div>
    <el-row type="flex" align="middle">
      <el-button @click="reset">Reset</el-button>
      <!-- <el-button @click="start">Start</el-button> -->
      <el-button @click="step">Step</el-button>
      <el-button @click="loop">Loop</el-button>
      <el-button @click="pause">Pause</el-button>
      <p>Current:{{ currentStep }}</p>
      <el-tag type="success" v-if="connected">Connected</el-tag>
      <el-tag type="danger" v-if="!connected">Disconnected</el-tag>
    </el-row>
    <el-row>
      <dynamic-form :interactiveParams="interactiveParams"></dynamic-form>
      <div id="myChart" :style="{ width: '800px', height: '800px' }"></div>
    </el-row>
    <chart-list :seriesConfig="seriesConfig" ref="chartList"></chart-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import * as echarts from "echarts";
import "echarts-gl";
import DynamicForm, {
  ParamType,
  ParamsData,
} from "@/components/dynamicform/DynamicForm.vue";
import BaseVisualizer from "./BaseVisualizer.vue";
import ChartList from "@/components/dynamicChart/ChartList.vue";
export default defineComponent({
  extends: BaseVisualizer,
  components: {
    DynamicForm,
    ChartList,
  },
  name: "hello",
  data() {
    return {};
  },
  mounted() {
    this.initChart();
    this.connect();
  },
  methods: {
    async setData(data: echarts.EChartsOption): Promise<void> {
      const t0 = new Date();
      if (data == null || data.series == null) {
        throw Error;
      }
      const d: Array<Array<number | string>> = (data.series[0] as any).data;
      for (let i = 0; i < d.length; i++) {
        if (d[i][3] < 0) {
          d[i][2] = "-";
        }
      }
      const t1 = new Date();
      // console.log(data);
      this.$chart.setOption(data);
      const t2 = new Date();
      console.log(
        `Render time consumption: ${
          (t2.valueOf() - t0.valueOf()) / 1000
        }, preprocessing takes: ${(t1.valueOf() - t0.valueOf()) / 1000}`
      );

      console.log(`fps:${1000 / (Date.now() - this.lastUpdate)}`);

      this.lastUpdate = Date.now();
    },

    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(document.getElementById("myChart") as any);
      // 绘制图表
      // const t0 = new Date();
      // this.$chart.setOption(this.$echartOptions as any);
      // const t1 = new Date();
      // console.log(t1.getTime() - t0.getTime());
    },
    sendCommand(cmd: number, data: any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
  },
});
</script>

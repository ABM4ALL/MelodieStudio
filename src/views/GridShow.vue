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
      <dynamic-form
        :interactiveParams="interactiveParams"
        @param-changed="paramChanged"
        :paramsModified="paramsModified"
      ></dynamic-form>
      <grid-visualizer ref="grid-visualizer" />
      <!-- <div id="myChart" :style="{ width: '800px', height: '800px' }"></div> -->
    </el-row>
    <chart-list :seriesConfig="seriesConfig" ref="chartList"></chart-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import DynamicForm, {
  ParamType,
  ParamsData,
} from "@/components/dynamicform/DynamicForm.vue";
import BaseVisualizer from "./BaseVisualizer.vue";
import ChartList from "@/components/dynamicChart/ChartList.vue";
import GridVisualizer from "@/components/visualizer/GridVisualizer.vue";
export default defineComponent({
  extends: BaseVisualizer,
  components: {
    GridVisualizer,
    DynamicForm,
    ChartList,
  },
  name: "hello",
  data() {
    return {};
  },
  mounted() {
    // this.initChart();
    this.connect();
  },
  methods: {
    async setData(data: echarts.EChartsOption): Promise<void> {
      const visualizer = this.$refs["grid-visualizer"] as typeof GridVisualizer;
      visualizer.setData(data);
    },

    initChart() {
      // 基于准备好的dom，初始化echarts实例
      // this.$chart = echarts.init(document.getElementById("myChart") as any);
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

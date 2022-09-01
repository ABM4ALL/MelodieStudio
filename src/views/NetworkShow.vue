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
      <div id="myChart" :style="{ width: '600px', height: '600px' }"></div>
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
import BaseVisualizer from "@/components/visualizer/BaseVisualizerComponent.vue";
import ChartList from "@/components/dynamicChart/ChartList.vue";
import { DRAWING_MODES } from "@/models/visualizerbasics";

export default defineComponent({
  extends: BaseVisualizer,
  components: {
    DynamicForm,
    ChartList,
  },
  name: "hello",
  data() {
    return {
      option: {
        title: {
          text: "Basic Graph",
        },
        tooltip: {},

        series: [
          {
            // type: "graph",
            type: "graphGL",
            layout: "none",
            animation: false,
            symbolSize: 5,
            symbol: "circle",
            // zoom: 5,
            roam: true,
            // label: {
            //     show: true
            // },
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [4, 5],
            // edgeLabel: {
            //   fontSize: 20,
            // },
            itemStyle: {
              opacity: 1,
            },
            categories: [
              {
                name: 0,
                itemStyle: {
                  color: "#ff0000",
                },
              },
              {
                name: 1,
                itemStyle: {
                  color: "#ffff00",
                },
              },
            ],
            data: [
              {
                name: "Node 1",
                x: 300,
                y: 300,
                category: 0,
              },
              {
                name: "Node 2",
                x: 800,
                y: 300,
                category: 1,
              },
              {
                name: "Node 3",
                x: 550,
                y: 100,
                category: 1,
              },
              {
                name: "Node 4",
                x: 550,
                y: 500,
                category: 0,
              },
            ],
            // links: [],
            links: [
              {
                source: 0,
                target: 1,
                symbolSize: [5, 20],
                lineStyle: {
                  width: 5,
                  curveness: 0.2,
                },
              },
              {
                source: "Node 2",
                target: "Node 1",
                label: {
                  show: true,
                },
                lineStyle: {
                  curveness: 0.2,
                },
              },
              {
                source: "Node 1",
                target: "Node 3",
              },
              {
                source: "Node 2",
                target: "Node 3",
              },
              {
                source: "Node 2",
                target: "Node 4",
              },
              {
                source: "Node 1",
                target: "Node 4",
              },
            ],
            // lineStyle: {
            //   opacity: 0.9,
            //   width: 2,
            //   curveness: 0,
            // },
          },
        ],
      } as echarts.EChartsOption,
    };
  },
  mounted() {
    this.initChart();
    this.connect();
    console.log(JSON.stringify(this.option));
  },
  methods: {
    async setData(data: echarts.EChartsOption): Promise<void> {
      console.log("data", data);

      // (this.option.series as echarts.GraphSeriesOption[])[0].data = series.data;
      // (this.option.series as echarts.GraphSeriesOption[])[0].links =
      //   series.links;

      if (this.drawingMode === DRAWING_MODES.WEBGL) {
        const series: echarts.GraphSeriesOption[] =
          data.series as echarts.GraphSeriesOption[];
        if (series === undefined) {
          console.error("series undefined");
          return;
        }
        const xRange = [0, 0];
        const yRange = [0, 0];
        const nodeData: Array<{ x: number; y: number }> = series[0].data! as any;
        for (let i = 0; i < nodeData.length; i++) {
          const x = nodeData[i].x;
          const y = nodeData[i].y;
          if (x < xRange[0]) {
            xRange[0] = x;
          } else if (x > xRange[1]) {
            xRange[1] = x;
          }
          if (y < yRange[0]) {
            yRange[0] = y;
          } else if (y > yRange[1]) {
            yRange[1] = y;
          }
        }

        for (let i = 0; i < nodeData.length; i++) {
          nodeData[i].x = (((nodeData[i].x - xRange[0]) /
            (xRange[1] - xRange[0])) *
            800) as any;
          nodeData[i].y = (((nodeData[i].y - yRange[0]) /
            (yRange[1] - yRange[0])) *
            500) as any;
        }
      }

      const t0 = new Date();
      this.$chart.setOption(data);
      // this.$chart.setOption({
      //   series: [
      //     {
      //       data: series.data,
      //       links: series.links,
      //     },
      //   ],
      // });
      const t1 = new Date();
      console.log((t1.valueOf() - t0.valueOf()) / 1000);
    },

    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(document.getElementById("myChart") as any);
      // 绘制图表
      // this.$chart.setOption(this.option as any);
    },
  },
});
</script>

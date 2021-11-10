<template>
  <div>
    <el-row>
      <el-button @click="reset">Reset</el-button>
      <!-- <el-button @click="start">Start</el-button> -->
      <el-button @click="step">Step</el-button>
      <el-button @click="loop">Loop</el-button>
      <el-button @click="pause">Pause</el-button>
      <p>Current:{{ currentStep }}</p>
    </el-row>
    <el-row>
      <dynamic-form :interactiveParams="interactiveParams"></dynamic-form>
      <div id="myChart" :style="{ width: '800px', height: '600px' }"></div>
    </el-row>
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
enum STATES {
  UNCONFIGURED = 0,
  READY = 1,
  RUNNING = 2,
  FINISHED = 3, // Finished running
  PAUSED = 4, // Paused
  LOOP = 5,
  STEP = 6,
}
enum DRAWING_MODES {
  CANVAS = 0,
  WEBGL = 1,
  SVG = 2,
}

enum COMMANDS {
  STEP = 0,
  RESET = 1,
  CURRENT_DATA = 2,
  START = 3,
  GET_PARAMS = 4,
  SET_PARAMS = 5,
}

type StatusType = number;
type ModelStateType = number;

interface VisualizationData {
  data: echarts.SeriesOption;
}

interface VisData {
  type: string;
  step: number;
  data: echarts.EChartsOption | ParamsData;
  modelState: ModelStateType;
  status: StatusType;
}

export default defineComponent({
  components: {
    DynamicForm,
  },
  name: "hello",
  data() {
    return {
      interactiveParams: {} as ParamsData,
      drawingMode: DRAWING_MODES.WEBGL,
      visualizationState: STATES.STEP,
      currentStep: 0,
      STATES: STATES,
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
    this.drawLine();

    this.$ws = new WebSocket("ws://127.0.0.1:8765");
    this.$ws.onopen = () => {
      console.log("websocket 就绪");
      this.sendCommand(COMMANDS.CURRENT_DATA, {});
      this.sendCommand(COMMANDS.GET_PARAMS, {});
    };

    this.$ws.onmessage = (wsStatus: MessageEvent) => {
      // if (wsStatus.data!=="") {
      //   return;
      // }
      console.log(wsStatus);

      const data: VisData = JSON.parse(wsStatus.data);
      if (data.type === "params") {
        console.log(wsStatus.data);
        console.log(data);
        this.updateParams(data.data as ParamsData);
        return;
      }

      this.currentStep = data.step;
      // If status is OK, show data;
      // else show alert message!
      if (data.status === 0) {
        this.setData(data.data as echarts.EChartsOption);
        // When the running finished, if the visualization mode was loop,
        //   change it to step!
        if (data.modelState === this.STATES.FINISHED) {
          window.alert("Finished, please reset this model!");
          this.visualizationState = this.STATES.STEP;
        }

        if (this.visualizationState === this.STATES.LOOP) {
          this.loop();
        }
      } else {
        window.alert(data.data);
      }
    };
  },
  methods: {
    // start() {
    //   this.$ws.send("START");
    //   this.visualizationState = this.STATES.STEP;
    // },
    updateParams(params: ParamsData) {
      console.log(params);
      this.interactiveParams = params;
    },
    step() {
      this.sendCommand(COMMANDS.STEP, {});
      this.visualizationState = this.STATES.STEP;
    },

    reset() {
      this.sendCommand(COMMANDS.RESET, {});
      this.visualizationState = this.STATES.STEP;
      this.sendCommand(COMMANDS.CURRENT_DATA, {});
    },

    loop() {
      this.sendCommand(COMMANDS.STEP, {});
      this.visualizationState = this.STATES.LOOP;
    },

    pause() {
      this.visualizationState = this.STATES.STEP;
    },

    async setData(data: echarts.EChartsOption): Promise<void> {
      const series: echarts.GraphSeriesOption =
        data.series as echarts.GraphSeriesOption;
      if (series === undefined) {
        console.error("series undefined");
        return;
      }
      // let series:Array<{data:echarts.number}> = this.option.series! as any;
      if (this.option.series === undefined) {
        return;
      }
      (this.option.series as echarts.GraphSeriesOption[])[0].data = series.data;
      (this.option.series as echarts.GraphSeriesOption[])[0].links =
        series.links;

      if (this.drawingMode === DRAWING_MODES.WEBGL) {
        const xRange = [0, 0];
        const yRange = [0, 0];
        const nodeData: Array<{ x: number; y: number }> = series.data! as any;
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
      this.$chart.setOption({
        series: [
          {
            data: series.data,
            links: series.links,
          },
        ],
      });
      const t1 = new Date();
      console.log((t1.valueOf() - t0.valueOf()) / 1000);
    },

    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(document.getElementById("myChart") as any);
      // 绘制图表
      this.$chart.setOption(this.option as any);
    },

    sendCommand(cmd: number, data: any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
  },
});
</script>

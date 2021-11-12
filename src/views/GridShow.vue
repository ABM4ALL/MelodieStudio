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
    const width = 100;
    const height = 100;
    return {
      connected: false,
      commandSent: 0,
      lastUpdate: 0 as number,
      width: width,
      height: height,
      interactiveParams: {} as ParamsData,
      drawingMode: DRAWING_MODES.WEBGL,
      visualizationState: STATES.STEP,
      currentStep: 0,
      STATES: STATES,
    };
  },
  mounted() {
    this.initChart();
    this.connect();
  },
  methods: {
    updateParams(params: ParamsData) {
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
      this.commandSent = Date.now();
    },

    pause() {
      this.visualizationState = this.STATES.STEP;
    },

    async setData(data: echarts.EChartsOption): Promise<void> {
      const t0 = new Date();
      const d: Array<Array<number | string>> = (data.series as any).data;
      for (let i = 0; i < d.length; i++) {
        if (d[i][3] < 0) {
          d[i][2] = "-";
        }
      }
      const t1 = new Date();
      this.$chart.setOption({
        series: [{ data: d }],
      });
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
      const t0 = new Date();
      this.$chart.setOption(this.$echartOptions as any);
      const t1 = new Date();
      console.log(t1.getTime() - t0.getTime());
    },
    sendCommand(cmd: number, data: any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
    connect() {
      this.$ws = new WebSocket("ws://127.0.0.1:8765");
      this.$ws.onopen = () => {
        console.log("websocket 就绪");
        this.sendCommand(COMMANDS.CURRENT_DATA, {});
        this.sendCommand(COMMANDS.GET_PARAMS, {});
        this.connected = true;
      };
      this.$ws.onclose = () => {
        this.connected = false;
        this.reconnect();
      };
      this.$ws.onmessage = (wsStatus: MessageEvent) => {
        console.log(
          `time taken Since command sent:${Date.now() - this.commandSent}`
        );
        const data: VisData = JSON.parse(wsStatus.data);
        if (data.type === "params") {
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
    reconnect() {
      if (this.connected) {
        return;
      } else {
        setTimeout(() => {
          this.connect();
          console.log("trying to reconnect...");
        }, 2000);
      }
    },
  },
  created() {
    let hours: number[] = [];
    for (let i = 0; i < this.width; i++) {
      hours.push(i + 1);
    }
    let days: number[] = [];
    for (let i = 0; i < this.height; i++) {
      days.push(i + 1);
    }
    let data: any[] = [];

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        // data.push({ value: [i, j],label: {}, itemStyle: { color: "#ff0000" } });
        if (Math.random() > 0.5) {
          data.push([i, j, 1, 1]);
        } else {
          data.push([i, j, 1, 2]);
        }
      }
    }
    this.$echartOptions = {
      // animation
      animation: false,
      progressiveThreshold: 100000,
      tooltip: {
        position: "top",
      },
      grid: {
        height: "80%",
        top: "10%",
      },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: 1,
        max: 3,
        calculable: true,
        orient: "horizontal",
        // orient: "vertical",
        left: "center",
        color: ["#e33e33", "#fec42c", "#409eff"],
        //[ "#e33e33", "#fec42c", "#15d249"]
        // bottom: "15%",
      },
      series: [
        {
          universalTransition: {
            enabled: false,
          },
          name: "Punch Card",
          type: "heatmap",
          data: data,
          // label: {
          //   show: true,
          // },
          // emphasis: {
          //   itemStyle: {
          //     shadowBlur: 10,
          //     shadowColor: "rgba(0, 0, 0, 0.5)",
          //   },
          // },
        },
      ],
    } as echarts.EChartsOption;
  },
});
</script>

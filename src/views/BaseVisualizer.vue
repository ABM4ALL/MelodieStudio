<script lang="ts">
import {
  InitialParams,
  ParamsData,
} from "@/components/dynamicform/DynamicForm.vue";
import Vue, { defineComponent } from "vue";
import {
  CommandParams,
  COMMANDS,
  DRAWING_MODES,
  STATES,
  VisData,
  VisualizerData,
} from "@/components/visualizer/visualizerbasics";
import * as echarts from "echarts";
import "echarts-gl";
import {
  IncrementalData,
  SeriesConfig,
} from "@/components/dynamicChart/chartutils";
export default defineComponent({
  data() {
    return {
      connected: false,
      interactiveParams: {} as ParamsData,
      paramValues: {} as InitialParams,
      paramsModified: false,
      drawingMode: DRAWING_MODES.WEBGL,
      visualizationState: STATES.STEP,
      currentStep: 0,
      STATES: STATES,
      commandSent: 0,
      lastUpdate: 0 as number,

      seriesConfig: {} as SeriesConfig,
    };
  },
  methods: {
    updateParams(params: ParamsData) {
      this.interactiveParams = params;

      this.$nextTick(() => {
        this.paramsModified = false;
      });
    },
    paramChanged(params: InitialParams) {
      this.paramValues = params;
      this.paramsModified = true;
    },
    sendCommand(cmd: number, data: CommandParams): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
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
    connect() {
      this.$ws = new WebSocket("ws://127.0.0.1:8765");
      this.$ws.onopen = () => {
        console.log("websocket ready!");

        this.sendCommand(COMMANDS.GET_PARAMS, {});
        this.sendCommand(COMMANDS.INIT_OPTIONS, {});
        this.sendCommand(COMMANDS.CURRENT_DATA, {});
        this.connected = true;
      };
      this.$ws.onclose = () => {
        this.connected = false;
        this.reconnect();
      };
      this.$ws.onmessage = (wsStatus: MessageEvent) => {
        const data: VisData = JSON.parse(wsStatus.data);
        if (data.type === "params") {
          this.updateParams(data.data as ParamsData);
          return;
        } else if (data.type === "initOption") {
          (this.$refs["grid-visualizer"] as any).setOption(
            data.data as echarts.EChartsOption
          );
          return;
        } else if (data.type === "initPlotSeries") {
          this.seriesConfig = (data.data as any).charts as SeriesConfig;
          console.log("seriesConfig", this.seriesConfig);
        } else {
          this.currentStep = data.step;
          // If status is OK, show data;
          // else show alert message!
          if (data.status === 0) {
            this.setData((data.data as VisualizerData).visualizers[0].data);
            let plots: IncrementalData[] = (data.data as any).plots;
            if (plots != null && plots.length > 0) {
              (this.$refs["chartList"] as any).addData(this.currentStep, plots);
            } else {
              console.error("No plot defined.");
            }
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
        }
      };
    },
    async setData(data: echarts.EChartsOption): Promise<void> {
      return;
    },

    step() {
      this.sendCommand(COMMANDS.STEP, {});
      this.visualizationState = this.STATES.STEP;
    },

    reset() {
      this.sendCommand(COMMANDS.RESET, {
        params: this.paramValues,
      });
      this.paramsModified = false;
      this.visualizationState = this.STATES.STEP;
      this.sendCommand(COMMANDS.CURRENT_DATA, {});
      const chartList = this.$refs["chartList"] as any;
      chartList.reset();
    },

    loop() {
      this.sendCommand(COMMANDS.STEP, {});
      this.visualizationState = this.STATES.LOOP;
    },

    pause() {
      this.visualizationState = this.STATES.STEP;
    },
  },
});
</script>
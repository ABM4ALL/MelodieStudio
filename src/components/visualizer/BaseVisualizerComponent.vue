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
  FileModel,
  NotificationModel,
  STATES,
  VisData,
  VisualizerData,
  VisualizeViewInitialOption,
} from "@/models/visualizerbasics";
import * as echarts from "echarts";
import "echarts-gl";
import {
  IncrementalData,
  SeriesConfig,
} from "@/components/dynamicChart/chartutils";
import { GridItem } from "@/models/agents";
import { ElNotification } from "element-plus";
import { downloadFile, downloadFileByBase64 } from "@/utils/file";
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
      lastLoopRequest: 0 as number,
      fpsLimit: 10 as number,
      visualizers: [] as VisualizeViewInitialOption[],

      seriesConfig: {} as SeriesConfig,
      visualizerData: {},
      unMounted: false,
    };
  },
  methods: {
    updateParams(params: ParamsData) {
      this.interactiveParams = params;
      (this.$refs['dynamic-form'] as any).setupModels(params.paramModels);
      (this.$refs['dynamic-form'] as any).setupValues(params.initialParams);

      this.$nextTick(() => {
        this.paramsModified = false;
      });
    },
    // paramChanged(params: InitialParams) {
    //   this.paramValues = params;
    //   this.paramsModified = true;
    //   // this.$refs['dynamic-form'].paramValues = 
    // },
    sendCommand(cmd: COMMANDS, data: CommandParams | any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
    reconnect() {
      if (this.connected) {
        return;
      } else {
        if (this.unMounted) {
          return;
        }
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

        this.sendCommand(COMMANDS.GET_PARAMS, { name: "" });
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
        } else if (data.type == "notification") {
          const notification = data.data as NotificationModel
          ElNotification({ ...notification })
          return
        } else if (data.type == "file") {
          const f = data.data as FileModel
          // const file = new File()
          // file.arrayBuffer
          downloadFileByBase64(f.name, f.content)
          // console.log(file)
        } else if (data.type === "initOption") {
          const visualizerIDs: VisualizeViewInitialOption[] = [];
          for (let i in data.data) {
            visualizerIDs.push(data.data[i]);
          }
          this.visualizers = visualizerIDs;
          this.$nextTick(() => {
            for (let i in data.data) {
              (this.$refs[`grid-visualizer-${i}`] as any)[0].setOption(
                data.data[i] as echarts.EChartsOption
              );
            }
          });

          return;
        } else if (data.type === "initPlotSeries") {
          this.seriesConfig = (data.data as any).charts as SeriesConfig;
        } else {
          this.currentStep = data.period;
          // If status is OK, show data;
          // else show alert message!
          if (data.status === 0) {
            const visualizerData = data.data as VisualizerData;
            console.log(visualizerData.visualizers);
            for (let i = 0; i < visualizerData.visualizers.length; i++) {
              // this.setData((data.data as VisualizerData).visualizers[0].data);
              this.setData(i, visualizerData.visualizers[i].data);
              this.updateData(visualizerData.visualizers[i] as any);
            }

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
              const gap = Date.now() - this.lastLoopRequest;

              let interval = 0;
              let minTimeGap = 1000 / this.fpsLimit;
              console.log(gap, minTimeGap);
              if (gap < minTimeGap) {
                interval = minTimeGap - gap;
              } else {
                interval = 0;
              }
              window.setTimeout(() => {
                if (this.visualizationState === this.STATES.LOOP) {
                  this.loop();
                  this.lastLoopRequest = Date.now();
                }
              }, interval);
            }
          } else {
            console.error(data.data);
            window.alert(data.data);
          }
        }
      };
    },
    async updateData(data: {
      agents: GridItem;
      spots: GridItem;
    }): Promise<void> {
      return;
    },
    async setData(i: number, data: echarts.EChartsOption): Promise<void> {
      return;
    },

    step() {
      this.sendCommand(COMMANDS.STEP, {});
      this.visualizationState = this.STATES.STEP;
    },

    reset() {
      this.sendCommand(COMMANDS.RESET, {
        params: (this.$refs['dynamic-form'] as any).getValues(),
      });
      (this.$refs['dynamic-form'] as any).setUnmodified()
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
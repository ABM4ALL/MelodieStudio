<style scoped>
.params-area {
  max-height: calc(100vh - 50px - 20px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-width: calc(var(--form-width) + 1vw);
  min-width: calc(var(--form-width) + 1vw);
  --form-width: 22vw;
  --label-width: 12vw;
}

.widgets-area {
  position: relative;
  flex-grow: 1;
  overflow: scroll;
  height: calc(100vh - 60px);
}
</style>
<template>
  <div
    style="position: relative; height: 100%; display: flex; flex-direction: column; padding: 10px; box-sizing: border-box;">
    <toolbar @reset="reset" @step="step" @loop="loop" @pause="pause" @fps-limit-change="fpsLimit = $event"
      :currentStep="currentStep" :connected="connected" :ws-host="currentWSHost" @ws-host-change="onWSHostChange">
      <template v-slot:left-items>
        <params-selector @load-params="onLoadParams" @export-database="onDownloadDatabase" @save-params="onSaveParams"
          :ws-host="currentWSHost" @save-database="onSaveDatabase" :param-sets="interactiveParams.allParamSetNames"
          :actions="actions">
        </params-selector>
      </template>
      <template v-slot:right-items>
        <div>
          Intro Page
          <el-switch v-model="showHelpDoc"></el-switch>
        </div>
      </template>
    </toolbar>

    <div style="position: relative; flex-grow: 1; display: flex; flex-direction: row;">
      <div class="params-area">

        <dynamic-form ref="dynamic-form"></dynamic-form>
      </div>

      <div class="widgets-area">
        <markdown-viewer style="width:100%; height:100%" v-show="showHelpDoc"
          :ws-host="currentWSHost"></markdown-viewer>
        <div style="width:100%; height:100%" v-show="!showHelpDoc">
          <template v-for="(_item, i) in visualizers" :key="_item.name">
            <grid-component :ref="`grid-visualizer-new-${i}`" v-if="_item.type == 'grid'" :name="_item.name"
              :visualizerIndex="i" :visualizerData="visualizerData[_item.name]" :desiredFPS="fpsLimit"
              :columns="_item.columns" :rows="_item.rows">
            </grid-component>
            <network-component v-else-if="_item.type == 'network'" :options="visualizerData[_item.name]"
              :name="'network-visualizer-' + _item.name"></network-component>
          </template>

          <chart-list :seriesConfig="seriesConfig" ref="chartList" :style="{ position: 'absolute' }"></chart-list>
        </div>

      </div>

      <!-- <el-row> -->

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import * as echarts from "echarts";
import "echarts-gl";

import DynamicForm from "@/components/dynamicform/DynamicForm.vue";
import { setVisualizerHost, getCurrentVisualizerHost } from "@/api/visualizer"
import { getContainersLayout } from "@/components/basic/dragcontainers";
import BaseVisualizer from "../components/visualizer/BaseVisualizerComponent.vue";
import ChartList from "@/components/dynamicChart/ChartList.vue";
import GridVisualizer from "@/components/visualizer/GridVisualizer.vue";
import Toolbar from "@/components/visualizer/Toolbar.vue";
import GridComponent from "@/components/visualizer/GridComponent.vue";
import NetworkComponent from "@/components/visualizer/NetworkViewer.vue";
import { GridItem } from "@/models/agents";
import { COMMANDS, NewVisualizerData } from "@/models/visualizerbasics";
import ParamsSelector from "@/components/visualizer/ParamsSelector.vue"
import MarkdownViewer from "@/components/markdown-viewer/MarkdownViewer.vue"
import { ElNotification } from "element-plus";
export default defineComponent({
  extends: BaseVisualizer,
  components: {
    DynamicForm,
    ChartList,
    Toolbar,
    GridComponent,
    ParamsSelector,
    MarkdownViewer,
    NetworkComponent
  },
  name: "hello",
  data() {
    return {
      showHelpDoc: false,
      visualizerData: {} as {
        [key: string]: {
          agents: GridItem[];
          spots: GridItem[];
        };
      },
    };
  },
  beforeCreate() {
    getContainersLayout();
  },
  beforeUnmount() {
    this.unMounted = true;
    this.$ws.close();
  },
  mounted() {
    getCurrentVisualizerHost().then((host: string) => {
      this.currentWSHost = host;
      this.connect();
    })
  },
  methods: {
    onStep() {
      this.showHelpDoc = false
    },
    onWSHostChange(newWSHost: string) {
      this.currentWSHost = newWSHost
      this.$ws.close()
      setVisualizerHost(this.currentWSHost)
    },
    getVisualizer(index: number): typeof GridVisualizer {
      const visualizers: any = this.$refs[`grid-visualizer-${index}`];
      if (visualizers == null) {
        throw Error(`No grid visualizer matching index ${index}`);
      } else {
        return visualizers[0] as typeof GridVisualizer;
      }
      // as typeof GridVisualizer;
    },

    async setData(
      visualizerIndex: number,
      data: echarts.EChartsOption
    ): Promise<void> {
      // this.getVisualizer(visualizerIndex).setData(data);
    },

    async updateData(data: NewVisualizerData): Promise<void> {

      const t0 = Date.now();
      this.visualizerData[data.name] = data;
      await nextTick();
      const t1 = Date.now();
    },

    sendCommand(cmd: number, data: any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
    onSaveParams(paramSetName: string): void {
      if (this.interactiveParams.allParamSetNames.indexOf(paramSetName) < 0) {
        this.$ws.send(JSON.stringify({ cmd: COMMANDS.SAVE_PARAMS, data: { name: paramSetName, params: (this.$refs['dynamic-form'] as any).getValues() } }));
        this.interactiveParams.allParamSetNames.push(paramSetName)
      } else {
        ElNotification.error(`Duplicated parameter set name: ${paramSetName}`)
      }

    },
    onLoadParams(paramSetName: string): void {
      this.$ws.send(JSON.stringify({ cmd: COMMANDS.GET_PARAMS, data: { name: paramSetName } }));
    },
    onSaveDatabase(databaseName: string): void {
      this.$ws.send(JSON.stringify({ cmd: COMMANDS.SAVE_DATA, data: { name: databaseName } }));
    },
    onDownloadDatabase(exportedName: string): void {
      this.$ws.send(JSON.stringify({ cmd: COMMANDS.DOWNLOAD_DATA, data: { name: exportedName } }));
    }

  },
});
</script>

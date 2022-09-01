<template>
  <div style="position: relative">
    <toolbar
      @reset="reset"
      @step="step"
      @loop="loop"
      @pause="pause"
      @fps-limit-change="fpsLimit = $event"
      :currentStep="currentStep"
      :connected="connected"
    ></toolbar>
    <dynamic-form
      :interactiveParams="interactiveParams"
      @param-changed="paramChanged"
      :paramsModified="paramsModified"
    ></dynamic-form>
    <el-row>
      <grid-component
        :ref="`grid-visualizer-new-${i}`"
        v-for="(_item, i) in visualizers"
        :key="i"
        :name="_item.name"
        :visualizerIndex="i"
        :visualizerData="visualizerData[_item.name]"
        :desiredFPS="fpsLimit"
        :columns="_item.columns"
        :rows="_item.rows"
      >
      </grid-component>
    </el-row>
    <chart-list
      :seriesConfig="seriesConfig"
      ref="chartList"
      :style="{ position: 'absolute' }"
    ></chart-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import DynamicForm, {
  ParamType,
  ParamsData,
} from "@/components/dynamicform/DynamicForm.vue";
import { getContainersLayout } from "@/components/basic/dragcontainers";
import BaseVisualizer from "../components/visualizer/BaseVisualizerComponent.vue";
import ChartList from "@/components/dynamicChart/ChartList.vue";
import GridVisualizer from "@/components/visualizer/GridVisualizer.vue";
import Toolbar from "@/components/visualizer/Toolbar.vue";
import GridComponent from "@/components/visualizer/GridComponent.vue";
import { GridItem } from "@/models/agents";
import { NewVisualizerData } from "@/models/visualizerbasics";
export default defineComponent({
  extends: BaseVisualizer,
  components: {
    DynamicForm,
    ChartList,
    Toolbar,
    GridComponent,
  },
  name: "hello",
  data() {
    return {
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
  mounted() {
    this.connect();
  },
  methods: {
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
      // if (this.visualizerData[data.name] == null) {
      this.visualizerData[data.name] = data;
      // }else{
      //   this.visualizerData[data.name].agents = data.agents;
      // }
      await nextTick();
      const t1 = Date.now();
      console.log(t1 - t0);
    },

    sendCommand(cmd: number, data: any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
  },
});
</script>

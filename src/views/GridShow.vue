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
      <grid-visualizer
        :ref="`grid-visualizer-${i}`"
        v-for="(_item, i) in visualizers"
        :key="i"
        :visualizerIndex="i"
      />
    </el-row>
    <chart-list
      :seriesConfig="seriesConfig"
      ref="chartList"
      :style="{ position: 'absolute' }"
    ></chart-list>
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
import { getContainersLayout } from "@/components/basic/dragcontainers";
import BaseVisualizer from "./BaseVisualizer.vue";
import ChartList from "@/components/dynamicChart/ChartList.vue";
import GridVisualizer from "@/components/visualizer/GridVisualizer.vue";
import Toolbar from "@/components/visualizer/Toolbar.vue";
export default defineComponent({
  extends: BaseVisualizer,
  components: {
    GridVisualizer,
    DynamicForm,
    ChartList,
    Toolbar,
  },
  name: "hello",
  data() {
    return {};
  },
  beforeCreate() {
    getContainersLayout();
  },
  mounted() {
    this.connect();
  },
  methods: {
    getVisualizer(index: number): typeof GridVisualizer {
      return this.$refs[`grid-visualizer-${index}`] as typeof GridVisualizer;
    },

    async setData(
      visualizerIndex: number,
      data: echarts.EChartsOption
    ): Promise<void> {
      this.getVisualizer(visualizerIndex).setData(data);
    },

    sendCommand(cmd: number, data: any): void {
      this.$ws.send(JSON.stringify({ cmd: cmd, data: data }));
    },
  },
});
</script>

<template>

  <drag-container @container-changed="onContainerLayoutChanged" :slotComponentID="'visualizer-' + name">
    <div :id="elID" :style="{ width: width + 'px', height: height + 'px' }"></div>
  </drag-container>

</template>

<script lang="ts">
import DragContainer from "@/components/basic/DragContainer.vue";
import { defineComponent } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import data from "./data.json"

export default defineComponent({
  name: "hello",
  props: {
    options: { type: Object, required: true },
    name: String
  },
  components: { DragContainer },
  data() {
    return {
      elID: this.name + "visualizer",
      width: 600,
      height: 600,
    };
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(document.getElementById(this.elID) as any);
      // 绘制图表
    },
    onContainerLayoutChanged(newLayout: {
      left: number;
      top: number;
      width: number;
      height: number;
    }) {
      if (this.width == newLayout.width && this.height == newLayout.height) {
        return;
      } else {
        this.width = newLayout.width;
        this.height = newLayout.height;
        this.$chart.resize({ width: this.width, height: this.height });
      }
    }
  },
  watch: {
    options: function (this: any) {
      if (this.options == null || this.options.graph == null) {
        return
      }
      this.$chart.setOption(this.options.graph as any);
    }
  }
});
</script>

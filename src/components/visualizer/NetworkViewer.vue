<template>

  <drag-container @container-changed="onContainerLayoutChanged" :slotComponentID="'visualizer-' + name">
    <div :id="elID" :style="{ width: width + 'px', height: height + 'px' }"></div>
  </drag-container>

</template>

<script lang="ts">
import DragContainer from "@/components/basic/DragContainer.vue";
import { defineComponent } from "vue";
import * as echarts from "echarts";

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
      this.$chart.on('click', 'series', function (params) {
        console.log(params);
      });
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
    },
    getState(state: number) {
      const graph = this.options.graph
      if (graph != null) {
        const category: { name: string } = graph.series[0].categories[state]
        if (category != null) {
          return category.name
        }
      }
      return state
    }
  },
  watch: {
    options: function (this: any) {
      if (this.options == null || this.options.graph == null) {
        return
      }
      this.$chart.setOption(this.options.graph as any);
      this.$chart.setOption({
        tooltip: {
          formatter: (params: any | Array<any>, ticket: string, callback: (ticket: string, html: string) => void) => {
            const dataType = params.dataType
            if (dataType == "node") {
              const nodeData: { name: string, agentCategory: number, category: number } = params.data as any;
              const splitted = nodeData.name.split("-")
              const category = splitted[0]
              const state = nodeData.category
              const id = splitted[1]
              return `
              <div style="display: flex; flex-direction: column">
                <div>Category: ${category}</div>
                <div>Agent ID: ${id}</div>
                <div style="display: flex; align-items: center">
                  <div style="background-color: ${params.color}; width: 20px; height: 20px"></div>
                  <div style="margin-left: 6px">${this.getState(state)}</div>
                </div>
              </div>
              `
            } else {
              const nodeData: { source: string, target: string } = params.data as any;
              return `${nodeData.source} --> ${nodeData.target}`
            }
          }
        }
      })

    }
  }
});
</script>

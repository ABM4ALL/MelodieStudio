<template>
  <drag-container
    @container-changed="onContainrerLayoutChanged"
    :slotComponentID="'visualizer-' + visualizerIndex"
  >
    <div
      :id="canvasElementID"
      :style="{
        width: `100%`,
        height: '100%',
      }"
    ></div>
  </drag-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
import DragContainer from "@/components/basic/DragContainer.vue";
export default defineComponent({
  name: "hello",
  components: {
    DragContainer,
  },
  props: {
    visualizerIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      lastUpdate: 0 as number,
      canvasElementID: `chart-${Math.random() + Math.random()}`,
    };
  },
  mounted() {
    this.initChart();
  },
  methods: {
    onContainrerLayoutChanged(newLayout: {
      left: number;
      top: number;
      width: number;
      height: number;
    }) {
      this.$chart.resize({ width: newLayout.width, height: newLayout.height });
    },
    async setOption(data: echarts.EChartsOption) {
      this.$chart.setOption(data);
    },
    async setData(data: echarts.EChartsOption): Promise<void> {
      const t0 = new Date();
      if (data == null || data.series == null) {
        throw Error;
      }
      const d: Array<Array<number | string>> = (data.series[0] as any).data;
      for (let i = 0; i < d.length; i++) {
        if (d[i][3] < 0) {
          d[i][2] = "-";
        }
      }
      const t1 = new Date();
      this.$chart.setOption(data);
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
      this.$chart = echarts.init(
        document.getElementById(this.canvasElementID) as any
      );
    },
  },
});
</script>

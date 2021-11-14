<style >
.linechartIncremental .el-drawer__body {
  overflow: auto;
}
</style>
<template>
  <div class="linechartIncremental">
    <el-drawer v-model="configDialogShow" title="Chart Options" :modal="false">
      <chart-config
        @config-modified="onChartConfigModified"
        :initialOptions="chartOption"
        :selectionItems="selectionItems"
        :unchangeableItems="unchangeableItems"
      ></chart-config>
    </el-drawer>
    <el-button @click="onOpenConfigDlg">Tool</el-button>
    <div :id="chartDOMID" :style="{ width: '400', height: '300px' }"></div>
  </div>
</template>

<script lang="ts">
import ChartConfig from "./ChartConfig.vue";
import { defineComponent, PropType } from "@vue/runtime-core";
import { nanoid, random } from "nanoid";
import { generateLineSeriesGeneralOption } from "./chartutils";
import * as echarts from "echarts";
import "echarts-gl";
import { DataItem } from "element-plus/lib/el-transfer/src/transfer";

import { getChartInitialOptions, setChartInitialOptions } from "@/api/chart";
interface LineChartSeriesOption extends echarts.LineSeriesOption {
  data: Array<Array<number>>;
}

export default defineComponent({
  name: "IncrementalLineChart",
  emits: ["initialized"],
  components: { ChartConfig },
  props: {
    immediateRender: {
      default: false,
    },
    seriesNames: Object as PropType<Array<string>>,
    externalConfig: Object as PropType<any>,
    selectionItems: Object as PropType<any>,
    unchangeableItems: Object as PropType<any>,
  },
  data() {
    const genericSeriesOptions: echarts.LineSeriesOption[] = [];
    const legendData: { name: string }[] = [];
    const simulationData: { series: echarts.LineSeriesOption[] } = {
      series: [],
    };
    this.seriesNames?.map((seriesName: string) => {
      genericSeriesOptions.push(generateLineSeriesGeneralOption(seriesName));
      legendData.push({ name: seriesName });
      simulationData.series.push({ data: [], type: "line", name: seriesName });
    });
    return {
      chartDOMID: nanoid(),
      currentStep: 0,
      simulationData: simulationData as { series: echarts.LineSeriesOption[] },
      timer: undefined as number | undefined,
      needsRender: false,
      configDialogShow: false,
      chartOption: {
        forceUpdate: false,
        updatedAt: new Date(),
        title: {
          text: "Line Chart",
          subtext: "Fake Data",
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "value",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        series: genericSeriesOptions,
        legend: {
          data: legendData,
          orient: "vertical",
          show: true,
        },
        textStyle: {
          color: "#000000",
        },
      },
    };
  },
  // created() {

  // },
  mounted() {
    getChartInitialOptions("aaaaa").then((resp) => {
      const genericSeriesOptions: echarts.LineSeriesOption[] = [];
      const legendData: { name: string }[] = [];
      const simulationData: { series: echarts.LineSeriesOption[] } = {
        series: [],
      };
      this.seriesNames?.map((seriesName: string) => {
        genericSeriesOptions.push(generateLineSeriesGeneralOption(seriesName));
        legendData.push({ name: seriesName });
        simulationData.series.push({
          data: [],
          type: "line",
          name: seriesName,
        });
      });
      const chartNewOption: echarts.EChartsOption = resp.data as any;
      // chartNewOption.series = genericSeriesOptions;
      // (chartNewOption.legend as any).data = legendData;
      this.chartOption = chartNewOption as any;
      this.simulationData = simulationData;
      console.log("params updated!");
      this.$emit("initialized");
      this.needsRender = true;
      this.initChart();
      this.$chart.setOption(this.chartOption);

      this.timer = window.setInterval(() => {
        console.log("rendering!");
        if (this.needsRender && !this.immediateRender) {
          this.renderChart();
        }
      }, 1000);
    });
  },
  methods: {
    async addData(step: number, values: Array<number>): Promise<void> {
      if (this.simulationData === undefined) {
        console.error("this.simulationData undefined!");
        return;
      }
      if (this.simulationData.series === undefined) {
        console.error("series undefined!");
        return;
      }
      if (this.simulationData.series.length <= 0) {
        console.error("series length 0");
        return;
      }
      for (let i = 0; i < values.length; i++) {
        this.simulationData.series[i].data!.push([step, values[i]]);
      }
      this.needsRender = true;
      this.currentStep += 1;
    },
    renderChart() {
      this.$chart.setOption(this.simulationData);
      this.needsRender = false;
    },
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(
        document.getElementById(this.chartDOMID) as any
      );
    },
    getChartOption(): any {
      return this.chartOption;
    },
    onOpenConfigDlg(): void {
      this.configDialogShow = true;
      console.log(this.chartOption);
    },
    onChartConfigModified(config: any): void {
      this.chartOption = config;
      console.log("Modified!");
      this.$chart.setOption(this.chartOption);
      this.needsRender = true;
      setChartInitialOptions("aaaaa", this.chartOption).then((resp) => {
        console.log(resp);
      });
    },
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
  watch: {
    // externalConfig: {
    //   handler: function (this: any): void {
    //     console.log(this.externalConfig);
    //     // if (this.externalConfig.forceUpdate) {
    //     // const chartDom = document.getElementById(this.chartDOMID);
    //     // console.log(chartDom);
    //     // chartDom!.setAttribute("_echarts_instance_", "");
    //     // this.initChart();
    //     this.$chart.setOption(this.externalConfig, true);
    //     this.needsRender = true;
    //     return;
    //     // }
    //     // this.$chart.setOption(this.externalConfig, true);
    //     // this.needsRender = true;
    //     // console.log("external-option-changed", this.$chart.getOption());
    //   },
    //   deep: true,
    // },
  },
});
</script>

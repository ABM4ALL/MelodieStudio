<template>
  <div>
    <div id="myChart" :style="{ width: '600px', height: '600px' }"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts";
import "echarts-gl";
// import ChartList from "@/components/dynamicChart/ChartList.vue";
import { DRAWING_MODES } from "@/models/visualizerbasics";
import { loadNetworkFromFile } from "@/api/io";
export default defineComponent({
  name: "hello",
  data() {
    return {
      option: {
        title: {
          text: "Basic Graph",
        },
        tooltip: {},
        xAxis: {
          type: "value", //x轴一定要添加这一行！！！！
          splitLine: {
            show: true, //让网格显示
          },
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: true, //让网格显示
          },
        },
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: [0],
          },
          {
            type: "inside",
            yAxisIndex: [0],
          },
        ],
        series: [
          {
            // type: "graph",
            type: "graphGL",
            layout: "none",
            // animation: false,
            symbolSize: 5,
            symbol: "circle",
            // coordinateSystem: "cartesian2d",
            // zoom: 5,
            roam: true,
            // label: {
            //     show: true
            // },
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [4, 5],
            // edgeLabel: {
            //   fontSize: 20,
            // },
            itemStyle: {
              opacity: 1,
            },
            categories: [
              {
                name: 0,
                itemStyle: {
                  color: "#ff0000",
                },
              },
              {
                name: 1,
                itemStyle: {
                  color: "#ffff00",
                },
              },
            ],
            data: [
              {
                name: "Node 1",
                x: 300,
                y: 300,
                itemStyle: {
                  color: "#aaaa00",
                },
              },
              {
                name: "Node 2",
                x: 800,
                y: 300,
                category: 1,
              },
              {
                name: "Node 3",
                x: 550,
                y: 100,
                category: 1,
              },
              {
                name: "Node 4",
                x: 550,
                y: 500,
                category: 0,
              },
            ],
            // links: [],
            links: [
              {
                source: 0,
                target: 1,
                symbolSize: [5, 20],
                lineStyle: {
                  width: 5,
                  curveness: 0.2,
                },
              },
              {
                source: "Node 2",
                target: "Node 1",
                label: {
                  show: true,
                },
                lineStyle: {
                  curveness: 0.2,
                },
              },
              {
                source: "Node 1",
                target: "Node 3",
              },
              {
                source: "Node 2",
                target: "Node 3",
              },
              {
                source: "Node 2",
                target: "Node 4",
              },
              {
                source: "Node 1",
                target: "Node 4",
              },
            ],
            // lineStyle: {
            //   opacity: 0.9,
            //   width: 2,
            //   curveness: 0,
            // },
          },
          {
            name: "弱",
            type: "scatterGL",
            coordinateSystem: "cartesian2d",
            symbolSize: 100,
            // blendMode: "lighter",
            // large: true,
            itemStyle: {
              color: "rgb(20, 15, 2)",
            },
            roam: true,
            // postEffect: {
            //   enable: true,
            // },
            // silent: true,
            // dimensions: ["lng", "lat"],
            data: [
              [1, 1],
              [200, 20],
              [300, 300],
            ],
          },
        ],
      } as echarts.EChartsOption,
    };
  },
  mounted() {
    this.initChart();
    // this.connect();
    console.log(JSON.stringify(this.option));
    // loadNetworkFromFile();
  },
  methods: {
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.$chart = echarts.init(document.getElementById("myChart") as any);
      // 绘制图表
      this.$chart.setOption(this.option as any);
    },
  },
});
</script>

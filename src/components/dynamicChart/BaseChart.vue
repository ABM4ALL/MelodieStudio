<script lang="ts">
import { defineComponent, PropType } from "vue";
import { nanoid } from "nanoid";
import {
    ChartPolicies,
    CHART_TYPES,
    SingleSeriesConfig,
} from "./chartutils";
import { createBarChartDefaultData } from "./defaultoptions";
import * as echarts from "echarts";

import {
    deleteChartOptions,
    getChartInitialOptions,
    getChartPolicies,
    setChartInitialOptions,
} from "@/api/chart";

export default defineComponent({
    emits: ["initialized"],
    props: {
        immediateRender: {
            default: false,
        },
        chartName: {
            type: String,
            required: true,
        },
        seriesConfig: {
            type: Object as PropType<SingleSeriesConfig[]>,
            required: true,
        },
        externalConfig: Object as PropType<any>,
    },
    data() {
        // const defaultOptions = createBarChartDefaultData() as echarts.EChartsOption;
        return {
            type: "" as CHART_TYPES,
            selectionItems: {} as any,
            unchangeableItems: {} as any,
            chartDOMID: nanoid() as string,
            currentStep: 0 as number,
            simulationData: {

            } as {
                xAxis: {
                    type: 'category',
                    data: string[],
                    axisTick: {
                        alignWithLabel: boolean
                    }
                }[]
                ,
                series: { name: 'Direct', type: 'bar', data: number[] }[]
            },
            timer: undefined as number | undefined,
            needsRender: false as boolean,
            configDialogShow: false as boolean,
            chartOption: {} as echarts.EChartsOption
        };
    },
    beforeMount() {
        // Initial options includes two parts:
        // general options and initial data
        // if the simulation is running and the web page was refreshed, the initial data should be filled.
        getChartPolicies(CHART_TYPES.LINE_CHART).then((resp: ChartPolicies) => {
            this.selectionItems = resp.selectionItems;
            this.unchangeableItems = resp.unChangeableItems;
        });
        getChartInitialOptions(this.chartName).then(
            (resp: echarts.EChartsOption | null) => {
                if (resp !== null) {
                    this.chartOption = this.formatInitialOption(resp);
                }
                this.needsRender = true;
                this.initChart();
                this.$chart.setOption(this.chartOption);
                this.$emit("initialized", this.chartName);
                this.timer = window.setInterval(() => {
                    if (this.needsRender && !this.immediateRender) {
                        this.renderChart();
                    }
                }, 300);
            }
        );
    },
    methods: {
        formatInitialOption(option: echarts.EChartsOption): echarts.EChartsOption {
            return option
        },
        onLayoutChanged(evt: {
            left: number;
            top: number;
            width: number;
            height: number;
        }) {
            this.needsRender = true;
            if (this.$chart != null) {
                this.$chart.resize({ width: evt.width, height: evt.height });
            }
        },
        async onOptionDelete(): Promise<void> {
            await deleteChartOptions(this.chartName);

            const defaultOptions = createBarChartDefaultData();
            this.chartOption = defaultOptions as echarts.EChartsOption;
            this.$chart.setOption(this.chartOption);
            this.$chart.setOption(this.simulationData);
        },
        clear() {
            for (let i in this.simulationData.series) {
                this.simulationData.series[i].data = [];
            }
            this.currentStep = 0;
            this.needsRender = true;
        },
        renderChart() {
            this.$chart.setOption(this.simulationData);
            this.$chart.setOption({
                toolbox: {
                    show: true,
                    feature: {
                        dataZoom: {},
                        myTool1: {
                            show: true,
                            title: "Chart Configure",
                            icon: "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z",
                            onclick: () => {
                                this.configDialogShow = true;
                            },
                        },
                    },
                },
            });
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
        },
        onChartConfigModified(config: any): void {
            this.chartOption = config;
            this.$chart.setOption(this.chartOption);
            this.needsRender = true;
            setChartInitialOptions(this.chartName, this.chartOption).then((resp) => {
                console.log(resp);
            });
        },
    },
    beforeUnmount() {
        window.clearInterval(this.timer);
    },
    watch: {},
});
</script>



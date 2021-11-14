import { generateLineSeriesGeneralOption } from "./chartutils";

const linechartDefaultOptions: echarts.EChartsCoreOption = {

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
    series: null,
    legend: {
        data: null,
        orient: "horizontal",
        show: true,
    },
    textStyle: {
        color: "#000000",
    },

};

export const createLinechartDefaultData = (seriesNames: string[]): {
    genericOption: echarts.EChartsCoreOption;
    simulationData: { series: echarts.LineSeriesOption[] };
} => {
    const genericSeriesOptions: echarts.LineSeriesOption[] = [];
    const legendData: { name: string }[] = [];
    const simulationData: { series: echarts.LineSeriesOption[] } = {
        series: [],
    };
    seriesNames?.map((seriesName: string) => {
        genericSeriesOptions.push(generateLineSeriesGeneralOption(seriesName));
        legendData.push({ name: seriesName });
        simulationData.series.push({ data: [], type: "line", name: seriesName });
    });
    const option = JSON.parse(JSON.stringify(linechartDefaultOptions));
    option.legend.data = legendData;
    option.series = genericSeriesOptions;
    return { genericOption: option, simulationData: simulationData };
};
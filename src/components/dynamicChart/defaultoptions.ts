import { generateLineSeriesGeneralOption, SingleSeriesConfig } from "./chartutils";

const linechartDefaultOptions: echarts.EChartsCoreOption = {

    forceUpdate: false,
    updatedAt: new Date(),
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: "10%",
        containLabel: true
    },
    title: {
        text: "Line Chart",
        subtext: "",
    },
    xAxis: {
        type: "value",
        scale: true,
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

export const createLinechartDefaultData = (seriesNames: SingleSeriesConfig[]): {
    genericOption: echarts.EChartsCoreOption;
    simulationData: { series: echarts.LineSeriesOption[] };
} => {
    const genericSeriesOptions: echarts.LineSeriesOption[] = [];
    const legendData: { name: string }[] = [];
    const simulationData: { series: echarts.LineSeriesOption[] } = {
        series: [],
    };

    seriesNames.map((series: SingleSeriesConfig) => {
        const seriesName = series.seriesName;
        genericSeriesOptions.push(generateLineSeriesGeneralOption(seriesName));
        legendData.push({ name: seriesName });
        simulationData.series.push({ data: [], type: "line", name: seriesName });
    });
    const option = JSON.parse(JSON.stringify(linechartDefaultOptions));
    option.legend.data = legendData;
    option.series = genericSeriesOptions;
    return { genericOption: option, simulationData: simulationData };
};

export const createBarChartDefaultData = () => {
    return {
        title: {
            text: "Bar Chart",
            subtext: "",
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    rotate: 30,
                    interval: 0,
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: 'Direct',
                type: 'bar',
                barWidth: '60%',
                data: []
            }
        ]
    };
}

export const createPieChartDefaultData = () => {
    return {
        title: {
            text: 'Referer of a Website',
            subtext: 'Fake Data',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: 'Access From',
                type: 'pie',
                radius: '50%',
                data: [
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    }
};
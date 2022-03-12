import * as echarts from "echarts";
export enum CHART_TYPES {
    LINE_CHART = "lineChart",
}
const COLORS = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];

let colorPointer = 0;
export interface ChartPolicies {
    selectionItems: {
        [key: string]: string[];
    };
    unChangeableItems: {
        [key: string]: boolean;
    };
}

export interface SingleSeriesConfig {
    seriesName: string;
    data: number[];
    latest_data: number;
}
// {<chartName>: [{name: series1}, {name: series2}]}
export interface SeriesConfig {
    [key: string]: SingleSeriesConfig[];
}

export interface IncrementalData {
    chartName: string;
    series: { name: string; value: number }[];
}

// generate line series general options
export const generateLineSeriesGeneralOption = (name: string): echarts.LineSeriesOption => {
    const series: echarts.LineSeriesOption = {
        name: name,
        data: [],
        type: "line",
        smooth: true,

        lineStyle: {
            color: COLORS[colorPointer],
            width: 2,
            type: "solid",
        },
        symbol: "emptyCircle",
        showSymbol: false,
        symbolSize: 4,
        itemStyle: {
            color: COLORS[colorPointer],
            borderColor: "#000000",
            borderType: 'solid',
            borderWidth: 1,
            opacity: 1
        }
    };
    colorPointer += 1;
    if (colorPointer >= COLORS.length) {
        colorPointer = 0;
    }

    return series;
};

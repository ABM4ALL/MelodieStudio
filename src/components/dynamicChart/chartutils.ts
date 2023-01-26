import * as echarts from "echarts";
export enum CHART_TYPES {
    LINE_CHART = "lineChart",
    BAR_CHART = 'bar',
    PIE_CHART = 'pie'
}
const COLORS = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];

let colorPointer = 0;
let existedChartNum = 0;
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
    data: number[] | number[][];
    latest_data: number;
    type: "line" | "pie" | "bar"
}
// {<chartName>: [{name: series1}, {name: series2}]}
export interface SeriesConfig {
    [key: string]: SingleSeriesConfig[];
}

export interface IncrementalData {
    chartName: string;
    series: { name: string; value: number }[];
}

export const getChartPosTop = (): number => {
    existedChartNum += 1;
    return (existedChartNum - 1) * 320;
};

// generate line series general options
export const generateLineSeriesGeneralOption = (name: string): echarts.LineSeriesOption => {
    const series: echarts.LineSeriesOption = {
        name: name,
        data: [],
        type: "line",
        // type: "bar",
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

export const computeInterval = (xRange: number): number => {
    const intervalInt = Math.floor(xRange / 5)
    // intervalInt舍入到最接近的1000.....
    const baseValue = Math.pow(10, Math.floor(Math.log10(intervalInt)))
    const times = [1, 2, 5, 10]
    for (const v of times) {
        const newInterval = baseValue * v
        const splits = Math.floor(xRange / newInterval)
        if (4 <= splits && splits < 11) {
            return newInterval
        }
    }
    return baseValue * 10
}
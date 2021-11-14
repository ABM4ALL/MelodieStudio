import * as echarts from "echarts";

const COLORS = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
let colorPointer = 0;
// generate line series general options
export const generateLineSeriesGeneralOption = (name: string): echarts.LineSeriesOption => {
    const series: echarts.LineSeriesOption = {
        data: [],
        type: "line",
        smooth: true,
        showSymbol: false,
        name: name,
        lineStyle: {
            color: COLORS[colorPointer],
            width: 2,
            type: "solid",
        },
        symbol: "emptyCircle",
        symbolSize: 4,
    };
    colorPointer += 1;
    if (colorPointer >= COLORS.length) {
        colorPointer = 0;
    }

    return series;
};

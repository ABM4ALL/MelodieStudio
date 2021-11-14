import request from "@/request";
export const getChartInitialOptions = async (chartName: string): Promise<any> => {
    const resp = await request.get("/api/chartOptions", { chartName });
    return resp;
};

export const setChartInitialOptions = async (chartName: string, chartOptions: echarts.EChartsCoreOption): Promise<any> => {
    return request.post("/api/setChartOptions", { chartName, chartOptions });
};

// getChartInitialOptions("aaaaa").then((resp) => {
//     console.log(resp);
// });
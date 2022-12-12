import { ChartPolicies } from "@/components/dynamicChart/chartutils";
import { LayoutManager } from "@/components/basic/dragcontainers";
import request from "@/request";
import axios from "axios";
export const getChartInitialOptions = async (chartName: string): Promise<echarts.EChartsOption | null> => {
    const resp = await request.get("/api/charts/chartOptions", { chartName });
    return resp.data as echarts.EChartsOption;
};

export const setChartInitialOptions = async (chartName: string, chartOptions: echarts.EChartsCoreOption): Promise<any> => {
    return request.post("/api/charts/setChartOptions", { chartName, chartOptions });
};


export const deleteChartOptions = async (chartName: string): Promise<void> => {
    await request.post("/api/charts/deleteChartOptions", { chartName });
};

export const getChartPolicies = async (chartType: string): Promise<ChartPolicies> => {
    // const resp = await request.get("/api/charts/getChartPolicies", { chartType });
    // return resp.data as ChartPolicies;
    return { selectionItems: {}, unChangeableItems: {} };
};

export const saveLayout = async (layout: any): Promise<any> => {
    const resp = await request.post("/api/charts/saveLayout", { layout });
    return resp.data as ChartPolicies;
};


export const getLayout = async (): Promise<LayoutManager> => {
    const resp = await request.get("/api/charts/getLayout", {});
    return resp.data as LayoutManager;
};

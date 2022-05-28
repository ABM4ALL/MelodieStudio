import { ChartPolicies } from "@/components/dynamicChart/chartutils";
import { LayoutManager } from "@/components/basic/dragcontainers";
import request from "@/request";
import { EChartsCoreOption } from "echarts";
export const getChartInitialOptions = async (chartName: string): Promise<echarts.EChartsCoreOption | null> => {
    const resp = await request.get("/api/charts/chartOptions", { chartName });
    if (resp.status === 0) {
        return resp.data as EChartsCoreOption;
    } else {
        console.error(resp.msg);
        return null;
    }
};

export const setChartInitialOptions = async (chartName: string, chartOptions: echarts.EChartsCoreOption): Promise<any> => {
    return request.post("/api/charts/setChartOptions", { chartName, chartOptions });
};


export const deleteChartOptions = async (chartName: string): Promise<void> => {
    const resp = await request.post("/api/charts/deleteChartOptions", { chartName });
    if (resp.status === 0) {
        return;
    } else {
        // console.error("get policies failed!");
        throw Error(resp.msg);
    }
};
export const getChartPolicies = async (chartType: string): Promise<ChartPolicies> => {
    const resp = await request.get("/api/charts/getChartPolicies", { chartType });
    if (resp.status === 0) {
        return resp.data as ChartPolicies;
    } else {
        // console.error("get policies failed!");
        throw Error(resp.msg);
    }
};

export const saveLayout = async (layout: any): Promise<any> => {
    const resp = await request.post("/api/charts/saveLayout", { layout });
    if (resp.status === 0) {
        return resp.data as ChartPolicies;
    } else {
        throw Error(resp.msg);
    }
};


export const getLayout = async (): Promise<LayoutManager> => {
    const resp = await request.get("/api/charts/getLayout", {});
    if (resp.status === 0) {
        return resp.data as LayoutManager;
    } else {
        // console.error("get policies failed!");
        return {};
    }
};
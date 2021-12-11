import request from "@/request";
import { ElMessage } from "element-plus";

export interface QueriedData {
    data: { [key: string]: number | string }[];
    schema: {
        fields: { name: string; type: string }[];
        pandas_version: string;
    };
}

export const getTableNames = async (): Promise<string[]> => {
    const resp = await request.get("/api/dbBrowser/tableNames");
    if (resp.status === 0) {
        return resp.data;
    } else {
        console.error(resp.msg);
        return [];
    }
};

export const query = async (sql: string): Promise<QueriedData> => {
    const resp = await request.get("/api/dbBrowser/query", {
        sql
    });
    if (resp.status === 0) {
        return resp.data as QueriedData;
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
};
import request from "@/request";
import { ElMessage } from "element-plus";
import { DataResponse, QueriedData } from "@/models/data_mani"
export interface DBMeta {
    type: "sqlite"
    sql?: string // sql to execute
}

export interface SQLiteMeta extends DBMeta {
    path: string
}



export interface TableDataMeta {
    path?: string
    data?: any
    sheet?: any
}

export const getTableNames = async (dbMeta: SQLiteMeta): Promise<string[]> => {
    const resp = await request.get("/api/dbBrowser/tableNames", dbMeta);
    if (resp.status === 0) {
        return resp.data;
    } else {
        console.error(resp.msg);
        return [];
    }
};

export const query = async (dbMeta: SQLiteMeta): Promise<QueriedData> => {
    const resp = await request.get("/api/dbBrowser/query", dbMeta);
    if (resp.status === 0) {
        return resp.data as QueriedData;
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
};

export const readTableFile = async (meta: TableDataMeta): Promise<DataResponse> => {
    const resp = await request.get("/api/dbBrowser/table_file_read", meta);
    if (resp.status === 0) {
        console.log(resp.data)
        return resp.data as DataResponse;
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
};

export const writeTableFile = async (meta: TableDataMeta): Promise<boolean> => {
    const resp = await request.post("/api/dbBrowser/table_file_write", meta);
    if (resp.status === 0) {
        return resp.data as boolean;
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
};

export const tableToLatex = async (meta: TableDataMeta): Promise<string> => {
    const resp = await request.post("/api/dbBrowser/table_to_latex", meta);
    if (resp.status === 0) {
        return resp.data as string;
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
}
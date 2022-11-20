import request from "@/request";
import { ElMessage } from "element-plus";
import { DataResponse, QueriedData } from "@/models/data_mani"
export interface DBMeta {
    type: "sqlite"
    sql?: string
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
    return resp.data;
};

export const query = async (dbMeta: SQLiteMeta): Promise<QueriedData> => {
    const resp = await request.get("/api/dbBrowser/query", dbMeta);
    return resp.data as QueriedData;
};

export const readTableFile = async (meta: TableDataMeta): Promise<DataResponse> => {
    const resp = await request.get("/api/dbBrowser/table_file_read", meta);
    return resp.data as DataResponse;
};

export const writeTableFile = async (meta: TableDataMeta): Promise<boolean> => {
    const resp = await request.post("/api/dbBrowser/table_file_write", meta);
    return resp.data as boolean;
};

export const tableToLatex = async (meta: TableDataMeta): Promise<string> => {
    const resp = await request.post("/api/dbBrowser/table_to_latex", meta);
    return resp.data as string;
}
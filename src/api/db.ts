import request from "@/request";
import { DataResponse, QueriedData } from "@/models/data_mani"
import { DatabaseBasicRequest, DatabaseQueryRequest } from "@/models/data";
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

export const getTableNames = async (dbMeta: DatabaseBasicRequest): Promise<string[]> => {
    const resp = await request.get("/api/dbBrowser/tableNames", dbMeta);
    return resp.data;
};

export const query = async (dbMeta: DatabaseQueryRequest): Promise<QueriedData> => {
    const resp = await request.get("/api/dbBrowser/query", dbMeta);
    return resp.data as QueriedData;
};

export const readTableFile = async (meta: TableDataMeta): Promise<DataResponse> => {
    const resp = await request.get("/api/files/tableFiles/excel/read", meta);
    return resp.data as DataResponse;
};

export const writeTableFile = async (meta: TableDataMeta): Promise<boolean> => {
    const resp = await request.post("/api/files/tableFiles/excel/writeSheet", meta);
    return resp.data as boolean;
};

export const tableToLatex = async (meta: TableDataMeta): Promise<string> => {
    const resp = await request.post("/api/files/tableFiles/conversions/toLatex", meta);
    return resp.data as string;
}
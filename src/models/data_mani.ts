export type TableTypes = "excel" | "csv"
export interface QueriedData {
    data: { [key: string]: number | string }[];
    schema: {
        fields: { name: string; type: string }[];
        pandas_version: string;
    };
}

export interface DataResponseMeta {
    widget: "table"
    type: TableTypes
}

export interface ExcelResponseMeta extends DataResponseMeta {
    currentSheet: string
    sheetNames: string[]
}

export interface DataResponse {
    payload: QueriedData
    meta: DataResponseMeta | ExcelResponseMeta
}
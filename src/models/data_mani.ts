export type TableTypes = "excel" | "csv"
export interface FSItem {
    name: string;
    type: string;
}

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

export interface MelodieNetwork {
    props: {
        directed: boolean,
        simple: boolean
    },
    nodes: { id: number, label: string, pos: { x: 0, y: 0 }, props: { [key: string]: any } }[],
    edges: { source: number, target: number, props: { [key: string]: any } }[]
}
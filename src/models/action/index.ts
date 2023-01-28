interface BasicOprandType {
    type: string
}

export interface FileOprandType extends BasicOprandType {
    type: 'file'
}

export interface ResponseOprandType extends BasicOprandType {
    type: "response"
}

export interface JSONOprandType extends BasicOprandType {
    type: "json"
}

export type OprandTypes = FileOprandType | ResponseOprandType | JSONOprandType

export interface Operation {
    name: string
    optypes: OprandTypes[]
    rettype: OprandTypes
    oprands: OperationTypes[]
}

type ResponseConversionOperation = Operation

export interface ResponseToFile extends ResponseConversionOperation {
    name: "op-response-to-file"
    rettype: FileOprandType
    defaultName: string
}

export interface ResponseToJson extends ResponseConversionOperation {
    name: "op-response-to-json"
    rettype: JSONOprandType
}

export interface DownloadOperation extends Operation {
    name: "op-download"
}

export interface ShowChartWindow extends Operation {
    name: "op-show-chart-window"
}

export type OperationTypes = ResponseToFile | DownloadOperation | ShowChartWindow
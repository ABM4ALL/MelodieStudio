interface BasicOprandType {
    type: string
}

export interface FileOprandType extends BasicOprandType {
    type: 'file'
}

export interface ResponseOprandType extends BasicOprandType {
    type: "response"
}

export type OprandTypes = FileOprandType | ResponseOprandType

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

export interface DownloadOperation extends Operation {
    name: "op-download"
}

export type OperationTypes = ResponseToFile | DownloadOperation
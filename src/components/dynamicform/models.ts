export type PyTypes = 'str' | 'int' | 'float' | 'bool' | 'selection' | "array"

export interface ParamValue {
    name: string;
    type: PyTypes;
    value: string | number | boolean | ParamValue[];
}

export interface ArrayParamsValue extends ParamValue {
    type: "array"
    value: ParamValue[]
}

export interface ParamType {
    name: string;
    type: PyTypes;
    label: string;
    component: string;
    readonly: boolean;
    description: string
}

export interface IntParamType extends ParamType {
    type: "int"
    min: number;
    max: number;
}

export interface FloatParamType extends ParamType {
    type: "float"
    min: number;
    max: number;
    step: number;
    percentage: boolean
}

export interface SelectionParamType extends ParamType {
    type: "selection";
    selections: { label: string, value: string | number }[]
}

export interface ArrayParamsType extends ParamType {
    type: "array",
    children: Array<BasicParamTypes>
}
export type BasicParamTypes = FloatParamType | IntParamType | SelectionParamType | ArrayParamsType



export type ParamsType = BasicParamTypes
export type ParamValuesType = Array<ParamValue>

export interface InitialParams {
    [key: string]: { value: number | string | boolean };
}

export interface ParamsData {
    paramModels: ParamsType;
    initialParams: InitialParams;
    allParamSetNames: string[]
}

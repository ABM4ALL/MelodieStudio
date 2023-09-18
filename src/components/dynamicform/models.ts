export type BasicDataTypes = 'str' | 'int' | 'float' | 'bool'
export type PyTypes = BasicDataTypes | 'selection' | "array"
export type FormComponentTypes = "auto" | "panel"
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
    component?: FormComponentTypes;
    readonly?: boolean;
    description?: string
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

export interface StringParamType extends ParamType {
    type: "str"
    pattern?: string
}

export interface BoolParamType extends ParamType {
    type: "bool"
}


export interface SelectionParamType extends ParamType {
    type: "selection";
    selections: { label: string, value: string | number }[]
}

export interface ArrayParamsType extends ParamType {
    type: "array",
    children: Array<BasicParamTypes>
    component: FormComponentTypes
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

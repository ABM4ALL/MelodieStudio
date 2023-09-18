import { BasicDataTypes } from "@/components/dynamicform/models"

const safetyCase = { "failure_mode": "asd", "failure_cause": "123", "failure_phenomenon": "xxxxxx", "id": 6, "name": "CASE003", "implications": "ssss" }

export type SafetyCase = typeof safetyCase

export interface TableDesc {
    name: string
    label: string
}

export interface ColumnScheme {
    name: string,
    type: BasicDataTypes,
    label: string,
    readonly: boolean,
    width: number,
    selectable: boolean // 是否可以通过元素选择的方式进行过滤
}
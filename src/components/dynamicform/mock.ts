import { ParamsType, ParamValuesType } from "./models";
import m from "./test.json"
// console.log('m', m)
export const mocked: ParamsType[] = m['model']
export const mockedValues: ParamValuesType = m['params-values']
console.log(mockedValues)
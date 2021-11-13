import DynamicForm, {
    ParamType,
    ParamsData,
    InitialParams
} from "@/components/dynamicform/DynamicForm.vue";
export enum STATES {
    UNCONFIGURED = 0,
    READY = 1,
    RUNNING = 2,
    FINISHED = 3, // Finished running
    PAUSED = 4, // Paused
    LOOP = 5,
    STEP = 6,
}
export enum DRAWING_MODES {
    CANVAS = 0,
    WEBGL = 1,
    SVG = 2,
}

export enum COMMANDS {
    STEP = 0,
    RESET = 1,
    CURRENT_DATA = 2,
    START = 3,
    GET_PARAMS = 4,
    SET_PARAMS = 5,
    INIT_OPTIONS = 6
}

export type StatusType = number;
export type ModelStateType = number;

export interface VisualizationData {
    data: echarts.SeriesOption;
}

export interface VisData {
    type: string;
    step: number;
    data: echarts.EChartsOption | ParamsData;
    modelState: ModelStateType;
    status: StatusType;
}
export interface CommandParams {
    params?: InitialParams;
}
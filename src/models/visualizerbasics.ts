import {
    ParamsData,
    InitialParams
} from "@/components/dynamicform/models";
import { SeriesModel } from "echarts";
import { IncrementalData, SeriesConfig } from "../components/dynamicChart/chartutils";
import { Operation, OperationTypes } from "./action";
import { GridItem } from "./agents";
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
    INIT_OPTIONS = 6,
    SAVE_PARAMS = 7,
    // LOAD_PARAMS = 8,
    SAVE_DATA = 8,
    DOWNLOAD_DATA = 9,
    // GENERAL_COMMAND = 10
}

export type StatusType = number;
export type ModelStateType = number;

export interface VisualizationData {
    data: echarts.SeriesOption;
}

export interface VisualizerData {
    visualizers: {
        name: string;
        type: string;
        data: echarts.EChartsOption;
    }[];
    plots: IncrementalData;

}

export interface NewVisualizerData {
    name: string;
    agents: GridItem[];
    spots: GridItem[];
}

export interface NewVisualizersData {
    visualizers: NewVisualizerData[];
    plots: IncrementalData;

}



interface VisComponentViewInitialOptions {
    name: string
    type: string
}

export interface GridVisComponentViewInitialOptions extends VisComponentViewInitialOptions {
    type: "grid"
    columns: number
    rows: number
}

export interface NetworkVisComponentViewInitialOptions extends VisComponentViewInitialOptions {
    type: "network"
    graph: any
}

export interface NotificationModel {
    title: string
    type: "error" | "info" | "warning" | "success"
    message: string
}

export interface FileModel {
    name: string
    content: string // base64 content
    // data: any
}

export type VisualizeViewInitialOption = GridVisComponentViewInitialOptions | NetworkVisComponentViewInitialOptions

export interface VisData {
    type: string;
    period: number;
    data: VisualizerData | ParamsData | SeriesConfig | NotificationModel | FileModel | Action[];
    modelState: ModelStateType;
    status: StatusType;
}

export interface CommandParams {
    params?: InitialParams;
}

export interface Action {
    key: string
    text: string,
    operation: OperationTypes
}
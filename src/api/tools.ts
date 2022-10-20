import { TerminalType } from "@/models/models";
import request from "@/request";
export const createNewProject = async (configurations: any): Promise<any> => {
    return request.post("/api/tools/createProject", configurations);
};

export const requestAutoComplete = async (configurations: { code: string, pos: number, file: string }): Promise<any> => {
    return request.post("/api/tools/autoComplete", configurations);
};

export const createPTY = async (cmd: string | string[], name: string): Promise<TerminalType> => {
    return (await request.post('/api/pty/create', { cmd, name })).data
}

export const resizePTY = async (termID: string, rows: number, cols: number): Promise<boolean> => {
    return (await request.post("/api/pty/resize", { termID, rows, cols }))
}

export const closePTY = async (termID: string): Promise<void> => {
    return (await request.post("/api/pty/close", { termID }))
}

export const allActivePTYs = async (): Promise<TerminalType[]> => {
    return (await request.get('/api/pty/all')).data
}
import request from "@/request";
export const createNewProject = async (configurations: any): Promise<any> => {
    return request.post("/api/tools/createProject", configurations);
};

export const requestAutoComplete = async (configurations: { code: string, pos: number, file: string }): Promise<any> => {
    return request.post("/api/tools/autoComplete", configurations);
};

export const createPTY = async (cmd: string | string[]): Promise<{ termID: string }> => {
    return (await request.post('/api/pty/create', { cmd })).data
}

export const resizePTY = async (termID: string, rows: number, cols: number): Promise<boolean> => {
    return (await request.post("/api/pty/resize", { termID, rows, cols }))
}

export const allActivePTYs = async (): Promise<string[]> => {
    return (await request.get('/api/pty/all')).data.terms
}
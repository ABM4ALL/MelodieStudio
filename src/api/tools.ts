import request from "@/request";
export const createNewProject = async (configurations: any): Promise<any> => {
    return request.post("/api/tools/createProject", configurations);
};

export const requestAutoComplete = async (configurations: { code: string, pos: number }): Promise<any> => {
    return request.post("/api/tools/autoComplete", configurations);
};
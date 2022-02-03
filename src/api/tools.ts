import request from "@/request";
export const createNewProject = async (configurations: any): Promise<any> => {
    return request.post("/api/tools/createProject", configurations);
};
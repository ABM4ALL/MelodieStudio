import request from "@/request";
export const getFSItems = async (directory: string): Promise<any> => {
    return request.get("/api/fs/getFSItems", { directory: directory });
};

export const gotoSubDir = async (directory: string, subdir: string): Promise<any> => {
    return request.get("/api/fs/gotoSubDir", { directory: directory, subdir: subdir });
};

export const gotoParentDir = async (directory: string): Promise<any> => {
    return request.get("/api/fs/gotoParentDir", { directory: directory });
};


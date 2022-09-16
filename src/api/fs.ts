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

export const getFSItemsRecursive = async (directory: string): Promise<any> => {
    return request.get("/api/fs/getFSItems", { directory: directory });
};

export const listDir = async (directory: string): Promise<any> => {
    return (await request.get("/api/fs/listDir", { directory })).data.fsItemsList;
};

export const getCWD = async (): Promise<string> => {
    return (await request.get("/api/tools/pwd")).data.pwd;
}

export const deleteFSItem = async (itemName: string): Promise<boolean> => {
    return (await request.post("/api/fs/delete", { itemName })).msg;
}
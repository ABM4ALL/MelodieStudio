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

export const getProjectMeta = async (): Promise<{ cwd: string, executable: string }> => {
    return (await request.get("/api/tools/projectMeta")).data;
}

export const deleteFSItem = async (itemName: string): Promise<boolean> => {
    return (await request.post("/api/fs/delete", { itemName })).msg;
}

export const getFile = async (fileName: string): Promise<string> => {
    return (await request.get("/api/fs/getFile", { fileName })).data.content
}

export const writeFile = async (fileName: string, content: string): Promise<boolean> => {
    return (await request.post("/api/fs/writeFile", { fileName, content }))
}
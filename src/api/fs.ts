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

export const getProjectMeta = async (): Promise<{ cwd: string, executable: string, os: "windows" | "linux" | 'darwin' }> => {
    return (await request.get("/api/tools/projectMeta")).data;
}

export const deleteFSItem = async (itemName: string): Promise<void> => {
    await request.post("/api/fs/delete", { itemName })
    // resp.msg
}

/*target could be file name or directory name.*/
export const moveFSItem = async (src: string, target: string): Promise<void> => {
    await request.post("/api/fs/move_to", { src, target })
    //.msg;
}

export const copyFSItem = async (src: string, target: string): Promise<void> => {
    await request.post("/api/fs/copy_to", { src, target })
}


export const getFile = async (fileName: string): Promise<string> => {
    return (await request.get("/api/fs/getFile", { fileName })).data.content
}

export const writeFile = async (fileName: string, content: string): Promise<void> => {
    await request.post("/api/fs/writeFile", { fileName, content })
}
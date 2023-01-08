import request from "@/request";
export const addVisualizerHost = async (visualizerHost: string): Promise<any> => {
    const res = await request.post("/api/visualizer/hosts/add", { host: visualizerHost });
    return res
};

export const setVisualizerHost = async (visualizerHost: string): Promise<any> => {
    const res = await request.post("/api/visualizer/hosts/set", { host: visualizerHost });
    return res
};

export const getAllVisualizerHosts = async (): Promise<string[]> => {
    const res = await request.get("/api/visualizer/hosts/all")
    return res.data
}


export const getCurrentVisualizerHost = async (): Promise<string> => {
    const res = await request.get("/api/visualizer/hosts/current")
    return res.data
}
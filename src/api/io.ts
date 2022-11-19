import { ElMessage } from "element-plus";
import request from "@/request"

export interface  NetworkMeta {
    path: string,
    gexfString?: string
}
export const loadNetworkFromFile = async (meta: NetworkMeta): Promise<string> => {
    const resp = await request.get("/api/dbBrowser/read_network", meta);
    if (resp.status === 0) {
        return resp.data as string;
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
};

export const exportNetworkToFile = async (meta: NetworkMeta): Promise<void> => {
    const resp = await request.post("/api/dbBrowser/write_network", meta);
    if (resp.status === 0) {
        return
    } else {
        ElMessage.error("Failed to execute command");
        throw Error;
    }
};

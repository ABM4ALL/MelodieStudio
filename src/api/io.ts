import { ElMessage } from "element-plus";
import request from "@/request"

export interface NetworkMeta {
    path: string,
    gexfString?: string
}
export const loadNetworkFromFile = async (meta: NetworkMeta): Promise<string> => {
    const resp = await request.get("/api/dbBrowser/read_network", meta);
    return resp.data as string;
};

export const exportNetworkToFile = async (meta: NetworkMeta): Promise<void> => {
    await request.post("/api/dbBrowser/write_network", meta);
};

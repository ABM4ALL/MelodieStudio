import request from "@/request"
import { SafetyCase } from "./models";
export const getAllSafetyInfo = async (): Promise<SafetyCase[]> => {
    try {
        const resp = await request.get("/api/safety-info-db/get_all_safety_info", {});
        return resp.data;
    } catch (err) {
        console.error(err)
        throw err
    }
};

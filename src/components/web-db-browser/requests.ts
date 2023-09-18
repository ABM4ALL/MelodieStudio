import request from "@/request"
import { SafetyCase, ColumnScheme, TableDesc } from "./models";
export class SafetyDBRequests {
    tableName: string
    constructor(tableName: string) {
        this.tableName = tableName
    }
    async getAllSafetyInfo(): Promise<SafetyCase[]> {
        try {
            const resp = await request.get("/api/safety-info-db/get_all_safety_info", {
                tableName: this.tableName
            });
            return resp.data;
        } catch (err) {
            console.error(err)
            throw err
        }
    }
    static async getAllTables(): Promise<TableDesc[]> {
        try {
            const resp = await request.get("/api/safety-info-db/all_tables");
            return resp.data;
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async getSchemas(): Promise<{ columns: ColumnScheme[] }> {
        try {
            const resp = await request.get("/api/safety-info-db/column_schemas", {
                tableName: this.tableName
            });
            return resp.data;
        } catch (err) {
            console.error(err)
            throw err
        }
    }


    async updateSafetyInfo(safetyInfo: Record<string, any>): Promise<void> {
        try {
            const resp = await request.post(`/api/safety-info-db/update_safety_info?tableName=${this.tableName}`, safetyInfo);
            return resp.data;
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async createSafetyInfo(safetyInfo: Record<string, any>): Promise<SafetyCase> {
        try {
            const resp = await request.post(`/api/safety-info-db/create_safety_info?tableName=${this.tableName}`, safetyInfo);
            return resp.data;
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    async deleteSafetyInfo(safetyInfo: Record<string, any>): Promise<SafetyCase> {
        try {
            const resp = await request.post(`/api/safety-info-db/delete_safety_info?tableName=${this.tableName}`, safetyInfo);
            return resp.data;
        } catch (err) {
            console.error(err)
            throw err
        }
    }
}

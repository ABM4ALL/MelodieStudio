export interface DatabaseBasicRequest {
    connectionString: string
}

export interface DatabaseQueryRequest extends DatabaseBasicRequest {
    sql: string
}
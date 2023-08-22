export interface FileSystemItem {
    name: string
    type: "directory" | "file"
    absPath: string
}

export interface FSResponseData {
    currentDirectory: string
    fsItemsList: FileSystemItem[]
}
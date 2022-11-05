import store from "@/store";

export interface Terminal {
    name: string
}

export const getCurrentOS = (): "windows" | "linux" | "darwin" => {
    return (store.state as any).controls.os
}

export const getSystemTerminal = (): string => {
    const os = getCurrentOS()
    if (os == "windows") {
        return "cmd"
    } else {
        return "bash"
    }
}

export const splitDiskSymbol = (absPath: string): string => {
    if (getCurrentOS() != "windows") {
        throw Error("Only windows has the concept of disk symbol!")
    }
    absPath = absPath.replaceAll("\\", "/")
    const diskSymbol = absPath.split("/")[0]
    return diskSymbol.toLowerCase()
}

export const generateChdirCommand = (targetDir: string): string => {
    const os = getCurrentOS()
    if (os == "windows") {
        const cwdDiskSymbol = splitDiskSymbol((store.state as any).controls.programcwd);
        const newDiskSymbol = splitDiskSymbol(targetDir);
        if (cwdDiskSymbol != newDiskSymbol) {
            return `cd /d ${targetDir}`
        }
    }
    return `cd ${targetDir}`
}

export const formatTerminalCommand = (cmd: string): string[] | string => {
    const os = getCurrentOS()
    if (os == "windows") {
        // return `cmd /C ${cmd}`
        return `cmd /C ${cmd}`
    } else {
        return ["bash", "-c", cmd]
    }
}
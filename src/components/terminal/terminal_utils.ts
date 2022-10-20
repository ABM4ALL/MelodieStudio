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

export const formatTerminalCommand = (cmd: string): string[] | string => {
    const os = getCurrentOS()
    if (os == "windows") {
        return `cmd /C ${cmd}`
    } else {
        return ["bash", "-c", cmd]
    }
}
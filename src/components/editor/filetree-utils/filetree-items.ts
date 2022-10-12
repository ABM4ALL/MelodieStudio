import store from "@/store";
import { baseName } from "@/utils/file";

type ENV_VAR = 'INTERPRETER' | 'FILEPATH' | "FILEBASENAME";
export interface FileTreeItemAction {
    icon: 'run' | 'build',
    label: string,
    action: {
        cmd?: string
    }
}
interface FileTreeItemType {
    match: RegExp,
    actions: FileTreeItemAction[]
}



export const FILETREE_ITEMTYPES: FileTreeItemType[] = [
    {
        match: new RegExp(".*.py"),
        actions: [{
            icon: 'run',
            label: 'Run this file',
            action: {
                cmd: '$INTERPRETER $FILEPATH'
            }
        }]
    }
]

export const loadItemActions = (fileABSPath) => {
    const fileBaseName = baseName(fileABSPath)
    // fileBaseName
    for (const itemType of FILETREE_ITEMTYPES) {
        if (itemType.match.test(fileBaseName)) {
            return itemType.actions
        }
    }
    return []
}


const getEnvVars = (fileABSPath: string): { [key in ENV_VAR]: string } => {
    return {
        INTERPRETER: (store.state as any).controls.interpreterMeta.executable,
        FILEPATH: fileABSPath,
        FILEBASENAME: baseName(fileABSPath)
    }
}

export const formatCMD = (fileABSPath: string, cmd: string): string => {
    const envVars = getEnvVars(fileABSPath)
    for (const k in envVars) {
        cmd = cmd.replaceAll('$' + k, envVars[k])
    }
    return cmd
}
// console.log(formatCMD('xxxx/xxx.py', FILETREE_ITEMTYPES[0].actions[0].action.cmd!))
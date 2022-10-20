import { requestOpenVisualizer } from "@/components/events/globalevents";
import store from "@/store";
import { baseName } from "@/utils/file";

type ENV_VAR = 'INTERPRETER' | 'FILEPATH' | "FILEBASENAME";
export interface FileTreeItemAction {
    icon: 'run' | 'build' | 'visualize',
    label: string,
    action: {
        cmd?: string,
        emitter?: () => void
    }
}
interface FileTreeItemType {
    match: RegExp,
    actions: FileTreeItemAction[]
}



export const FILETREE_ITEMTYPES: FileTreeItemType[] = [
    {
        match: new RegExp(".*\\.py$"),
        actions: [{
            icon: 'run',
            label: 'Run this file',
            action: {
                cmd: '$INTERPRETER $FILEPATH'
            }
        }]
    },
    {
        match: new RegExp("run_simulator\\.py$"),
        actions: [{
            icon: 'visualize',
            label: 'Open Visualizer',
            action: {
                emitter: () => {
                    requestOpenVisualizer()
                }
            }
        }]
    }
]

export const loadItemActions = (fileABSPath) => {
    const fileBaseName = baseName(fileABSPath)
    // fileBaseName
    let actions: FileTreeItemAction[] = []
    for (const itemType of FILETREE_ITEMTYPES) {
        if (itemType.match.test(fileBaseName)) {
            actions = actions.concat(itemType.actions)
        }
    }
    return actions
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
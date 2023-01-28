import mitt, { Handler, WildcardHandler } from 'mitt'
const emitter = mitt()

export const emitOnSave = () => {
    emitter.emit('request-save')
}

export const registerOnSaveCommand = (callback: (cmd: string) => void) => {
    emitter.on('request-save', callback as Handler)
}

export const unregisterOnSaveCommand = (callback: (cmd: string) => void) => {
    emitter.off('request-save', callback as Handler)
}

export const requestRunCommand = (cmd: string, termName: string) => {
    emitter.emit('request-run-command', { cmd, termName })
}

export const registerOnRunCommandRequest = (callback: (cfg: { cmd: string, termName: string }) => void) => {
    emitter.on('request-run-command', callback as Handler)
}

export const registerEvents = () => {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key == 's' && (e.ctrlKey || e.metaKey)) {
            emitOnSave()
            e.preventDefault()
        }
    });
}

export const setOnOpenVisualizer = (callback: () => void) => {
    emitter.on('open-visualizer', callback as Handler)
}

export const requestOpenVisualizer = () => {
    emitter.emit('open-visualizer')
}

export const showChartWindow = (options: any) => {
    emitter.emit('show-chart-window', options)
}

export const setOnShowChartWindow = (callback: (options: any) => void) => {
    emitter.on('show-chart-window', callback)
}
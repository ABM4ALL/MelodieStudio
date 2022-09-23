import mitt, { Handler, WildcardHandler } from 'mitt'
const emitter = mitt()

export const emitOnSave = () => {
    emitter.emit('request-save')
}

export const registerOnSaveCommand = (callback: (cmd: string) => void) => {
    emitter.on('request-save', callback as Handler)
}

export const registerEvents = () => {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key == 's' && (e.ctrlKey || e.metaKey)) {
            emitOnSave()
            e.preventDefault()
        }
    });
}
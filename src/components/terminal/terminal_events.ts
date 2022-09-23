import mitt, { Handler, WildcardHandler } from 'mitt'
const emitter = mitt()

export const requestRunCommand = (cmd: string) => {
    emitter.emit('run-command', cmd)
}

export const registerOnRunCommand = (callback: (cmd: string) => void) => {
    emitter.on('run-command', callback as Handler)
}
import mitt, { Handler } from 'mitt'
import { StatementBlockTypes } from './models'
const emitter = mitt()

export const requestUpdateComponent = (newBlock: StatementBlockTypes) => {
    emitter.emit('run-command', newBlock)
}

export const registerOnUpdateComponent = (callback: (newBlock: StatementBlockTypes) => void) => {
    emitter.on('run-command', callback as Handler)
}
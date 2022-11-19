import { WSMessage, WSToServerMessage } from "@/models/models";
import { CommandParams } from "@/models/visualizerbasics";

type CallbackList = ((s: string) => void)[]
type MessageType = "subprocess-output" | "plot" | "message" | "pty-output" | "pty-status-change" | "fs-event"
const _handlers: {
    [key in MessageType]: CallbackList
} = { "subprocess-output": [], plot: [], message: [], 'pty-output': [], 'fs-event': [], 'pty-status-change': [] };

function wsOnMessage(messageEvent: any) {
    const data: WSMessage[] = JSON.parse(messageEvent.data)
    if (_handlers == null) {
        throw Error
    }
    if (data == null) {
        throw Error
    }
    for (const ws_msg of data) {
        const type = ws_msg.type as MessageType
        let handled = false
        for (const handler of _handlers[type]) {
            handler(ws_msg.payload)
            handled = true
        }
        if (!handled) {
            console.error("Unhandled event data:", messageEvent.data)
        }
    }
}
function wsOnError(e: any) {
    console.error(e)
    return
}

const createWS = (): WebSocket => {
    const ws = new WebSocket(`ws://${window.location.host}/api/websocket`);
    ws.onmessage = wsOnMessage
    ws.onclose = wsOnClose
    ws.onerror = wsOnError
    return ws
}

let ws = createWS()

const wsOnClose = function () {
    return
}
window.setInterval(() => {
    if (ws.readyState !== ws.OPEN) {
        ws = createWS()
    }
}, 2000)

export const addOnMessageHandler = (type: MessageType, handler: (s: any) => void) => {

    _handlers[type].push(handler)
}

export const send = (msg: WSToServerMessage) => {
    ws.send(JSON.stringify(msg))
}

export const sendPtyCommand = (termID: string, cmd: string, msgType: 'new-pty' | 'close-pty' | 'cmd-pty') => {
    ws.send(JSON.stringify({ payload: { cmd, termID, msgType }, type: "pty-input" }))
}

export const sendCommand = (cmd: number, data: CommandParams): void => {
    send({ type: "command", payload: { cmd, data } })
}

export { ws }
// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

export interface WSMessage {
    type: string;
    payload: any | Array<any>;
}

export interface WSToServerMessage {
    type: "pty-input" | "command";
    payload: any;
}

export interface TerminalType {
    id: string;
    name: string;
    closed: boolean;
    command: string;
}
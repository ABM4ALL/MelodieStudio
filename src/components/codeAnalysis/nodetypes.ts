
export type NodeTypeNames = "entry" | "func_call" | "assignment" | "return" | "other"

export interface Node {
    type: NodeTypeNames,
}

export interface FuncCallNode extends Node {
    type: "func_call"
    funcName: string
    arguments: string[]
}

export interface AssignmentNode extends Node {
    type: "assignment"
    lvalue: string
    rvalue: string
}

export interface MethodReturnNode extends Node {
    type: "return"
}

export interface OtherNode extends Node {
    type: "other"
}

export type NodeTypes = FuncCallNode | AssignmentNode | MethodReturnNode | OtherNode

export function parseNodeText(nodeText: string): NodeTypes {
    // let nodeType: NodeTypeNames = 'other'
    const splitted = nodeText.split(",", 2)
    const _nodeTextPayload = splitted[1]
    const nodeTextPayload = _nodeTextPayload.slice(0, _nodeTextPayload.length - 1)
    if (nodeText.startsWith("(&lt;operator&gt;.assignment")) {
        const splitted = nodeTextPayload.split("=")
        return { type: "assignment", lvalue: splitted[0].trim(), rvalue: splitted[1].trim() }
    } else if (nodeText.startsWith("(RETURN") || nodeText.startsWith("(METHOD_RETURN")) {
        return { type: "return" }
    } else if (nodeText.startsWith("(METHOD") || nodeText.startsWith("(RETURN") || nodeText.startsWith("(&lt;operator&gt;")) {
        return { type: "other" }
    } else {
        const funcName = splitted[0].slice(1)
        return { type: "func_call", arguments: [], funcName }
    }
}
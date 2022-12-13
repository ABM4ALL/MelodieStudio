export interface BasicStatementBlock {
    uuid: string
    type: string
}

export interface ArithmeticBlock extends BasicStatementBlock {
    type: "arithmetic"
    symbol: "*" | "/" | "//" | "+" | "-" | "^" | "%"
    oprand1: RValueTypes
    oprand2: RValueTypes
}

export interface LogicBlock extends BasicStatementBlock {
    type: "logic"
    symbol: "==" | "<=" | "<" | ">" | ">=" | "!="
    oprand1: RValueTypes
    oprand2: RValueTypes
}

export interface AssignBlock extends BasicStatementBlock {
    type: "assign"
    target: LValueTypes
    value: RValueTypes
}

export interface VariableBlock extends BasicStatementBlock {
    type: "variable"
    name: string
    varType: "int" | "float" | "object"
}

// 属性获取语句
export interface AttributeBlock extends BasicStatementBlock {
    type: "attribute"
    object: RValueTypes
    attrName: string
}
// 索引获取语句
export interface IndexBlock extends BasicStatementBlock {
    type: "index"
    indexable: string
    index: VariableBlock
}

export interface CallBlock extends BasicStatementBlock {
    type: "call"
    callable: RValueTypes
    args: RValueTypes[]
}

export interface IfBlock extends BasicStatementBlock {
    type: "if"
    condition: RValueTypes
    body: StatementBlockTypes[]
}

export type StatementBlockTypes = AssignBlock | VariableBlock | AttributeBlock | IndexBlock | CallBlock | IfBlock | ArithmeticBlock | LogicBlock
export type LValueTypes = VariableBlock | AttributeBlock | IndexBlock
export type RValueTypes = LValueTypes | CallBlock | ArithmeticBlock | LogicBlock
export type BinOpTypes = ArithmeticBlock | LogicBlock

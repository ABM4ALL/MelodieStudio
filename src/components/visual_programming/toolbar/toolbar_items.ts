import { StatementBlockTypes } from "../models"
import { v4 as uuid } from "uuid";

export const toolBar: StatementBlockTypes[] = [
    { uuid: uuid(), type: "variable", name: "a", varType: "int" },
    {
        uuid: uuid(), type: "attribute",
        object: {
            uuid: uuid(), type: "attribute",
            object: { uuid: uuid(), type: "variable", name: "someVar", varType: "int" },
            attrName: 'innerAttr'
        },
        attrName: 'letp'
    },
    {
        uuid: uuid(), type: 'arithmetic', symbol: '*',
        oprand1: { uuid: uuid(), type: "variable", name: "a", varType: "int" },
        oprand2: { uuid: uuid(), type: "variable", name: "a", varType: "int" },
    },
    {
        uuid: uuid(),
        type: "if",
        condition: { uuid: uuid(), type: "variable", name: "a", varType: "int" }, body: [
            {
                uuid: uuid(), type: "assign",
                target: { uuid: uuid(), type: "variable", name: "a", varType: "int" },
                value: { uuid: uuid(), type: "variable", name: "b", varType: "int" }
            },
        ]
    }
]
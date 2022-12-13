import { deepCopy } from "@/utils/utils";
import { v4 as uuid } from "uuid";
import { StatementBlockTypes } from "./models"

export const updateBlockUUID = (item: StatementBlockTypes) => {
    if (!(typeof item == 'object')) {
        return
    }
    if (item.uuid != null) {
        item.uuid = uuid()
    }
    for (const key of Object.keys(item)) {
        const prop = item[key]
        if (typeof prop == 'object' && prop.uuid != null) {
            prop.uuid = uuid()
        } else if (Array.isArray(prop)) {
            for (const propItem of prop) {
                updateBlockUUID(propItem)
            }
        }
    }
}

export const deepcopyBlock = (block: StatementBlockTypes): StatementBlockTypes => {
    const newBlock: StatementBlockTypes = deepCopy(block)
    updateBlockUUID(newBlock)
    return newBlock
}


export const walkBlocksList = (blocksList: StatementBlockTypes[], callback: (StatementBlockTypes) => void): StatementBlockTypes | null => {
    for (const item of blocksList) {
        if (item.uuid == null) {
            continue
        }
        callback(item)
        const res = walkBlockObject(item, callback)
        if (res != null) {
            return res
        }
    }
    return null
}

export const walkBlockObject = (item: StatementBlockTypes, callback: (StatementBlockTypes) => void): StatementBlockTypes | null => {
    if (typeof item != 'object') {
        return null
    }
    callback(item)
    for (const key of Object.keys(item)) {
        const prop = item[key]
        if (Array.isArray(prop)) {
            const res = walkBlocksList(prop, callback)
            if (res != null) {
                return res
            }
        } else if (typeof prop == 'object') {
            const res = walkBlockObject(prop, callback)
            if (res != null) {
                return res
            }
        }
    }
    return null
}
<template>
    <!-- <div draggable="true" :ondragstart="drag">drag to add block</div> -->
    <common-component draggable="true" :ondragstart="(evt) => { drag(evt, tool) }" v-for="tool in toolBar"
        :key="tool.uuid" :block="(tool as any)">{{
                tool.type
        }}</common-component>
    <el-divider></el-divider>
    <base-block @add-block="onAddBlock" v-for="block in blocks" :block="block" :key="block.uuid"></base-block>
</template>
<script lang="ts" setup>
import BaseBlock from "./programming_blocks/StatementItem.vue"
import { StatementBlockTypes } from "./models"
import { v4 as uuid } from "uuid";
import { ref } from "vue"
import { registerOnUpdateComponent } from "./eventbus"
import CommonComponent from "./programming_blocks/CommonComponent.vue"
import { walkBlocksList } from "./utils"
import { toolBar } from "./toolbar/toolbar_items"

const blocks = ref<StatementBlockTypes[]>([
    {
        uuid: uuid(), type: "assign",
        target: { uuid: uuid(), type: "variable", name: "a", varType: "int" },
        value: { uuid: uuid(), type: "variable", name: "b", varType: "int" }
    },
    {
        uuid: uuid(), type: "call",
        callable: { uuid: uuid(), type: "variable", name: "func", varType: "int" },
        args: [
            { uuid: uuid(), type: "variable", name: "arg1", varType: "int" },
            { uuid: uuid(), type: "variable", name: "arg2", varType: "float" },
        ]
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
])

const onAddBlock = (evt: { uuid: string, newBlock: StatementBlockTypes }) => {
    console.log('add-block', evt)
    const index = blocks.value.findIndex((item) => item.uuid == evt.uuid)
    if (index == -1) {
        console.error('index does not exist', index, blocks)
        return
    }
    blocks.value.splice(index, 0, evt.newBlock)
    console.log(blocks)
}

const drag = (e: DragEvent, data) => {
    if (e.dataTransfer == null) {
        return
    }
    e.dataTransfer.setData("payload", JSON.stringify(data));
}

registerOnUpdateComponent((newBlock) => {
    const blockToUpdate = getBlockByUUID(newBlock.uuid)
    for (const key of Object.keys(blockToUpdate)) {
        blockToUpdate[key] = newBlock[key]
    }
})

const getBlockByUUID = (blockUUID: string): StatementBlockTypes => {
    const blocksToUpdate: StatementBlockTypes[] = []
    walkBlocksList(blocks.value,
        (block) => {
            if (block.uuid == blockUUID) {
                blocksToUpdate.push(block)
            }
        }
    )
    if (blocksToUpdate.length == 0) {
        console.error("block not found, uuid:", blockUUID, "all blocks:", blocks.value[5])
        throw Error("block not found!")
    }
    return blocksToUpdate[0]
}
</script>
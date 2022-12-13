<template>
    <statement-item v-for="block in blocks" :key="block.uuid" :block="block" @add-block="onAddBlock"></statement-item>
</template>
<style scoped>
.assign-statement {
    display: flex;
    flex-direction: row;
}
</style>
<script lang="ts" setup>
import { deepCopy } from "@/utils/utils";
import { defineProps, PropType, defineEmits } from "vue"
import { StatementBlockTypes } from "../models"
import StatementItem from "./StatementItem.vue"
const props = defineProps({
    blocks: { type: Object as PropType<StatementBlockTypes[]>, required: true }
})

const emits = defineEmits(['statements-updated'])

const onAddBlock = (evt: { uuid: string, newBlock: StatementBlockTypes }) => {
    console.log('add-block', evt)
    const blocks = deepCopy(props.blocks) as StatementBlockTypes[]
    const index = blocks.findIndex((item) => item.uuid == evt.uuid)
    if (index == -1) {
        console.error('index does not exist', index, blocks)
        return
    }
    blocks.splice(index, 0, evt.newBlock)
    console.log(blocks)
    emits('statements-updated', blocks)
}
</script>
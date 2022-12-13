<style>
.visual-programming-block {
    /* height: 80px; */
    border: 1px solid black;
    background-color: pink;
    position: relative;
}

.visual-programming-block-hover {
    background-color: aqua;
}
</style>
<template>
    <div :class="{
        'visual-programming-block': true,
        'visual-programming-block-hover': hasDragOn
    }" :ondragover="allowDrop" :ondragleave="onDragLeave" :ondrop="drop">
        <div style="position: absolute; margin-left: 300px;">
            <el-button @click="$emit('move-block', 'up')">^</el-button>
            <el-button @click="$emit('move-block', 'down')">v</el-button>
        </div>

        <common-component :block="block"></common-component>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { StatementBlockTypes } from "../models"
import { v4 as uuid } from "uuid";
import CommonComponent from "./CommonComponent.vue"
export default defineComponent({
    components: { CommonComponent },
    emits: ['add-block', 'move-block'],
    props: {
        block: { type: Object as PropType<StatementBlockTypes>, required: true },
    },
    data() {
        return {
            hasDragOn: false
        }
    },
    methods: {
        allowDrop(e: DragEvent) {
            this.hasDragOn = true
            e.preventDefault();
            e.stopPropagation()
            console.log("drag over!")
        },
        onDragLeave(e) {
            this.hasDragOn = false
            console.log('drag leave!')
        },
        drop(e) {
            e.preventDefault();
            e.stopPropagation();
            const data = JSON.parse(e.dataTransfer.getData("payload"));
            data.uuid = uuid()
            this.hasDragOn = false
            this.$emit('add-block', {
                pos: "after",
                uuid: this.block.uuid,
                newBlock: data
            })
        }
    }
})
</script>
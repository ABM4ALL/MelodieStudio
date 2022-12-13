<template>
    <div :ondragover="allowDrop" :ondragleave="() => { hasDrag = false }" :ondrop="onDrop"
        :class="{ 'replacable-component': replacable, 'replacable-component-has-drag': hasDrag }">
        <assign-block-vue v-if="block.type == 'assign'" :block="(block as AssignBlock)"></assign-block-vue>
        <bin-op-component v-if="block.type == 'arithmetic' || block.type == 'logic'"
            :block="(block as BinOpTypes)"></bin-op-component>
        <variable-block-vue v-else-if="block.type == 'variable'" :block="(block as VariableBlock)"></variable-block-vue>
        <if-component v-else-if="block.type == 'if'" :block="(block as IfBlock)"></if-component>
        <attribute-component v-else-if="block.type == 'attribute'"
            :block="(block as AttributeBlock)"></attribute-component>
        <call-component v-else-if="block.type == 'call'" :block="(block as CallBlock)"></call-component>
    </div>
</template>
<style scoped>
.replacable-component {
    border: 2px solid plum;
}

.replacable-component-has-drag {
    border: 2px solid orangered;
}
</style>
<script lang="ts" setup>
import { defineProps, PropType, defineEmits, ref } from "vue"
import { StatementBlockTypes, AssignBlock, VariableBlock, IfBlock, AttributeBlock, CallBlock, BinOpTypes } from "../models"
import VariableBlockVue from "./VariableComponent.vue";
import AssignBlockVue from "./AssignComponent.vue"
import IfComponent from "./IfComponent.vue"
import AttributeComponent from "./AttributeComponent.vue"
import CallComponent from "./CallComponent.vue"
import BinOpComponent from "./BinOpComponent.vue";
import { updateBlockUUID } from "../utils";
const props = defineProps({
    // If replacable, drop event propagation will be stopped
    // If not, drop event will still propagate.
    replacable: { type: Boolean, required: false, default: false },
    block: { type: Object as PropType<StatementBlockTypes>, required: true }
})

const hasDrag = ref(false)
const emit = defineEmits(['on-drop'])

const allowDrop = (e: DragEvent) => {
    if (props.replacable) {
        e.preventDefault();
        e.stopPropagation();
        hasDrag.value = true
    }
}

const onDrop = (e: DragEvent) => {
    if (props.replacable) {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer != null) {
            const data = JSON.parse(e.dataTransfer.getData("payload"))
            updateBlockUUID(data);
            emit('on-drop', data)
        }
        hasDrag.value = false
    }
}
</script>
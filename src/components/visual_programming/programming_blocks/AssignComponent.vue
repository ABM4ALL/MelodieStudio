<template>
    <div>
        <div class="assign-statement">
            <CommonComponent :block="block.target" @on-drop="onModifyLValue" :replacable="true">
            </CommonComponent>
            <span style="margin-left: 12px; margin-right: 12px">=</span>
            <CommonComponent :block="block.value" @on-drop="onModifyRValue" :replacable="true"></CommonComponent>
        </div>

    </div>

</template>
<style scoped>
.assign-statement {
    display: flex;
    flex-direction: row;
}
</style>
<script lang="ts" setup>
import { deepCopy } from "@/utils/utils";
import { defineProps, PropType } from "vue"
import { requestUpdateComponent } from "../eventbus";
import { AssignBlock, LValueTypes, RValueTypes } from "../models"
import CommonComponent from "./CommonComponent.vue";
const props = defineProps({
    block: { type: Object as PropType<AssignBlock>, required: true }
})

const onModifyLValue = (newLValue: LValueTypes) => {
    const blockCopy: AssignBlock = deepCopy(props.block)
    blockCopy.target = newLValue
    requestUpdateComponent(blockCopy)
}

const onModifyRValue = (newRValue: RValueTypes) => {
    const blockCopy: AssignBlock = deepCopy(props.block)
    blockCopy.value = newRValue
    requestUpdateComponent(blockCopy)
}
</script>
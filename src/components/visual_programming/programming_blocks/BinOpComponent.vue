<template>
    <div>
        <div class="assign-statement">
            <CommonComponent :block="block.oprand1" @on-drop="onModifyLValue" :replacable="true">
            </CommonComponent>
            <span style="margin-left: 12px; margin-right: 12px">{{ block.symbol }}</span>
            <CommonComponent :block="block.oprand2" @on-drop="onModifyRValue" :replacable="true"></CommonComponent>
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
import { BinOpTypes, LValueTypes, RValueTypes } from "../models"
import CommonComponent from "./CommonComponent.vue";
const props = defineProps({
    block: { type: Object as PropType<BinOpTypes>, required: true }
})

const onModifyLValue = (newLValue: LValueTypes) => {
    const blockCopy: BinOpTypes = deepCopy(props.block)
    blockCopy.oprand1 = newLValue
    requestUpdateComponent(blockCopy)
    console.log(props.block, newLValue)
}

const onModifyRValue = (newRValue: RValueTypes) => {
    const blockCopy: BinOpTypes = deepCopy(props.block)
    blockCopy.oprand2 = newRValue
    requestUpdateComponent(blockCopy)
}
</script>
<template>
    <div>
        <div class="call-statement">
            <CommonComponent :block="block.callable" @on-drop="onModifyCallable" :replacable="true">
            </CommonComponent>(
            <template v-for="(arg, i) in block.args" :key="arg.uuid">
                <CommonComponent :block="arg" @on-drop="onModifyArg(i, $event)" :replacable="true">
                </CommonComponent>,
            </template>

            )
        </div>

    </div>

</template>
<style scoped>
.call-statement {
    display: flex;
    flex-direction: row;
}
</style>
<script lang="ts" setup>
import { deepCopy } from "@/utils/utils";
import { defineProps, PropType } from "vue"
import { requestUpdateComponent } from "../eventbus";
import { CallBlock, RValueTypes } from "../models"
import CommonComponent from "./CommonComponent.vue";
const props = defineProps({
    block: { type: Object as PropType<CallBlock>, required: true }
})

const onModifyCallable = (newLValue: RValueTypes) => {
    const blockCopy: CallBlock = deepCopy(props.block)
    blockCopy.callable = newLValue
    requestUpdateComponent(blockCopy)
}

const onModifyArg = (i: number, newValue: RValueTypes) => {
    const blockCopy: CallBlock = deepCopy(props.block)
    blockCopy.args[i] = newValue
    requestUpdateComponent(blockCopy)
}
</script>
<template>
    <div class="if-component-outer">
        <div class="if-title">
            If
            <div class="if-condition">
                <common-component :block="block.condition" :replacable="true"
                    @on-drop="onUpdateCondition"></common-component>
            </div>
        </div>

        <div class="if-component-then">
            <statement-list :blocks="block.body" @statements-updated="onUpdateBody"></statement-list>
        </div>
    </div>
</template>
<style scoped>
.if-component-outer {
    background-color: blanchedalmond;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding-left: 12px;
}

.if-component-outer .if-title {
    display: flex;
    flex-direction: row;
}

.if-component-outer .if-title .if-condition {
    margin-left: 12px;
}
</style>
<script lang="ts" setup>
import { deepCopy } from "@/utils/utils";
import { defineProps, PropType } from "vue"
import { IfBlock, RValueTypes, StatementBlockTypes } from "../models"
import CommonComponent from "./CommonComponent.vue";
import StatementList from "./StatementList.vue";
import { requestUpdateComponent } from "../eventbus"
const props = defineProps({
    block: { type: Object as PropType<IfBlock>, required: true }
})

const onUpdateBody = (newBody: StatementBlockTypes[]) => {
    const blockCopy = deepCopy(props.block) as IfBlock
    blockCopy.body = newBody
    requestUpdateComponent(blockCopy)

}

const onUpdateCondition = (newCondition: RValueTypes) => {
    const blockCopy = deepCopy(props.block) as IfBlock
    blockCopy.condition = newCondition
    requestUpdateComponent(blockCopy)
}
</script>
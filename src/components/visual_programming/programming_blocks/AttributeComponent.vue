<template>
    <div>
        <div class="attribute-statement">
            <CommonComponent :block="block.object">
            </CommonComponent>
            <span>.{{ block.attrName }}</span>

        </div>

    </div>

</template>
<style scoped>
.attribute-statement {
    display: flex;
    flex-direction: row;
}
</style>
<script lang="ts" setup>
import { defineProps, PropType } from "vue"
import { AttributeBlock } from "../models"
import CommonComponent from "./CommonComponent.vue";
defineProps({
    block: { type: Object as PropType<AttributeBlock>, required: true }
})
</script>
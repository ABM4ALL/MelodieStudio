<template>
    <div class="variable-component">
        <!-- <span class="varlabel">Variable</span> -->
        <div>
            {{ block.name }}
        </div>
    </div>
</template>
<style scoped>
.variable-component {
    display: flex;
    flex-direction: column;
    background-color: aquamarine;
}

.variable-component .varlabel{
    font-size: 0.6em;
}
</style>
<script lang="ts" setup>
import { defineProps, PropType } from "vue"
import { VariableBlock } from "../models"
defineProps({
    block: { type: Object as PropType<VariableBlock>, required: true }
})
</script>
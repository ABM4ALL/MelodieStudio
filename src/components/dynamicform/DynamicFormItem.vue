<template>
    <div class="dynamic-form-item">
        <span class="form-item-label">{{ label }}</span>
        <el-input :model-value="modelValue" @update:model-value="onValueChange($event)">
        </el-input>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, PropType, defineEmits } from "vue"
import { ParamType } from "./DynamicForm.vue";
defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: Object as PropType<any>,
        required: true
    },
    componentModel: {
        type: Object as PropType<ParamType>,
        required: true
    }
})

const emits = defineEmits(['update:model-value'])
const onValueChange = (evt: any) => {
    emits('update:model-value', evt)
}
</script>
<style scoped>
.dynamic-form-item {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    margin-top: 8px;
}

.dynamic-form-item .form-item-label{
    max-width: var(--label-width);
    min-width: var(--label-width);
}
</style>
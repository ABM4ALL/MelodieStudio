<template>
    <div class="dynamic-form-item">
        <div class="dynamic-form-content">
            <span class="form-item-label">{{ label }}</span>

            <el-input class="form-item-input" :model-value="modelValue" @update:model-value="onValueChange($event)">
            </el-input>
        </div>
        <div v-if="numericValueErrorMsg != ''" class="form-error-label">
            {{ numericValueErrorMsg }}
        </div>

    </div>

</template>
<script lang="ts" setup>
import { defineProps, PropType, defineEmits, computed } from "vue"
import { ParamType } from "./DynamicForm.vue";
import { ParamsType } from "./models";
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: Object as PropType<any>,
        required: true
    },
    componentModel: {
        type: Object as PropType<ParamsType>,
        required: true
    }
})

const emits = defineEmits(['update:model-value'])
const onValueChange = (evt: any) => {

    emits('update:model-value', evt)
}
const numericValueErrorMsg = computed((): string => {
    if (props.componentModel.type == "float" || props.componentModel.type == "int") {
        if (props.componentModel.min <= props.modelValue && props.modelValue <= props.componentModel.max) {
            return ""
        } else {
            return `Value ${props.modelValue} out of
             range [${props.componentModel.min}, ${props.componentModel.max}]`
        }
    }
    return ""
})
</script>
<style scoped>
.dynamic-form-item {
    margin-top: 8px;
}

dynamic-form-content {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
}

.dynamic-form-item .form-item-label {
    max-width: var(--label-width);
    min-width: var(--label-width);
}

.form-item-input {
    margin-top: 4px;
}

.form-error-label {
    background-color: var(--el-alert-bg-color);
    color: var(--el-color-error);
    font-size: 0.8em;
    margin-top: 4px;
}
</style>
<template>
    <div class="dynamic-form-item">
        <div class="dynamic-form-content">
            <div class="form-item-header">
                
                <el-popover :show-after="500">
                    <template #reference>
                        <span class="form-item-label">{{ label }}</span>
                    </template>
                    <div class="form-item-help">
                        <span v-if="componentModel.description">Description: {{ componentModel.description }}</span>
                        <span v-if="isNumericValue">Range: {{ numericValueRange }}</span>
                        <el-button @click="resetToOriginal">Reset to: {{ originalValue }}
                        </el-button>
                    </div>

                </el-popover>
            </div>

            <el-input class="form-item-input" :model-value="formattedModelValue"
                @update:model-value="onValueChange($event)">

            </el-input>
        </div>
        <div v-if="numericValueErrorMsg != ''" class="form-error-label">
            {{ numericValueErrorMsg }}
        </div>

    </div>

</template>
<script lang="ts" setup>
import { eliminateFloatRoundoffError } from "@/utils/utils"
import { defineProps, PropType, defineEmits, computed, watch, onBeforeMount, ref, defineExpose } from "vue"
import { ParamType } from "./DynamicForm.vue";
import { FloatParamType, IntParamType, ParamsType } from "./models";
import { Search } from "@element-plus/icons-vue"
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

// If the model value was float, float round off error might happen.
// This method helps to eliminate the round off errors.
const formattedModelValue = computed((): string => {
    if (props.componentModel.type == 'float') {
        const s = `${props.modelValue}`
        return eliminateFloatRoundoffError(s)
    } else {
        return props.modelValue
    }
})

const isNumericValue = computed((): boolean => {
    return props.componentModel.type == 'float' || props.componentModel.type == 'int'
})

const numericValueRange = computed((): string => {
    if (isNumericValue.value) {

        const min = (props.componentModel as FloatParamType | IntParamType).min
        const max = (props.componentModel as FloatParamType | IntParamType).max
        return `[${min}, ${max}]`
    } else {
        return ''
    }
})

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

const originalValue = ref(null)

const resetToOriginal = () => {
    if (props.modelValue != originalValue.value) {
        onValueChange(originalValue)
    } else {
        return
    }
}
onBeforeMount(() => {
    originalValue.value = props.modelValue
})

defineExpose({ resetToOriginal })
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
    /* flex-grow: 1; */
    /* max-width: var(--label-width); */
    min-width: var(--label-width);
}

.form-item-header {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.form-item-input {
    margin-top: 4px;
}

.form-item-help {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.form-error-label {
    background-color: var(--el-alert-bg-color);
    color: var(--el-color-error);
    font-size: 0.8em;
    margin-top: 4px;
}
</style>
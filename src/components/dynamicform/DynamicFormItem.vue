<template>
    <div class="dynamic-form-item">
        <div class="dynamic-form-content">
            <div class="form-item-header">

                <el-popover :show-after="500" :width="300">
                    <template #reference>
                        <span class="form-item-label">{{ label }}</span>
                    </template>
                    <div class="form-item-help">
                        <span v-if="componentModel.description">Description: {{
                            componentModel.description.replaceAll("\n", "<br />")
                        }}</span>
                        <span v-if="isNumericValue">Range: {{ numericValueRange }}</span>
                        <span v-if="componentModel.readonly">Readonly</span>
                        <el-button @click="resetToOriginal">Reset to: {{ originalValue }}
                        </el-button>
                    </div>

                </el-popover>
            </div>
            <el-select v-if="props.componentModel.type == 'selection'" :model-value="valueShown" class="form-item-input"
                filterable @update:model-value="onValueChange($event)" :disabled="componentModel.readonly">
                <!-- <el-select v-model="value" class="m-2" placeholder="Select"> -->
                <el-option v-for="item in props.componentModel.selections" :key="item.value" :label="item.label"
                    :value="item.value" />
            </el-select>
            <el-input v-else class="form-item-input" :model-value="valueShown"
                @update:model-value="onValueChange($event)" :disabled="componentModel.readonly">
                <template #suffix v-if="props.componentModel.type == 'float' && props.componentModel.percentage">
                    %
                </template>
            </el-input>
        </div>
        <div v-if="numericValueErrorMsg != ''" class="form-error-label">
            {{ numericValueErrorMsg }}
        </div>

    </div>

</template>
<script lang="ts" setup>
import { eliminateFloatRoundoffError } from "@/utils/utils"
import { ElMessage, ElNotification } from "element-plus";
import { parse } from "path";
import { defineProps, PropType, defineEmits, computed, onBeforeMount, ref, defineExpose, watch } from "vue"
import { FloatParamType, IntParamType, ParamsType } from "./models";
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
const valueShown = ref('')
let timeout: number | null = null
const onValueChange = (evt: any) => {
    valueShown.value = evt
    if (timeout == null) {
        timeout = window.setTimeout(() => {
            timeout = null
            emits('update:model-value', convertValue())
        }, 500)
    }
}


watch(
    () => props.modelValue,
    (val, prevVal) => {
        updateShownValue()
        // valueShown.value = props.modelValue
    }
);
const convertValue = () => {
    if (props.componentModel.type == 'float') {
        try {
            let val = parseFloat(valueShown.value)
            if (props.componentModel.percentage) {
                val = val / 100
            }
            if (isNaN(val)) {
                throw Error
            }
            return val
        } catch (err) {
            console.error("value is not float", valueShown.value)
            const errText = `Cannot convert ${valueShown.value} to float value`
            ElNotification.error(errText)
            throw Error(errText)
        }
    } else if (props.componentModel.type == 'int') {
        try {
            const parsed = parseInt(valueShown.value)
            if (isNaN(parsed)) {
                throw Error
            }
            return parsed
        } catch (err) {
            const errText = `Cannot convert ${valueShown.value} to int value`
            ElNotification.error(errText)
            console.error("value is not int")
            throw Error(errText)
        }
    }
    return valueShown.value
}

const updateShownValue = () => {
    console.log('modelValue', props.modelValue)
    if (props.modelValue == null) {
        valueShown.value = ''
        return
    }
    if (props.componentModel.type == 'float') {
        const value = props.componentModel.percentage ? props.modelValue * 100 : props.modelValue
        const s = `${value}`
        valueShown.value = eliminateFloatRoundoffError(s)
    } else {
        valueShown.value = `${props.modelValue}`
    }
}

// If the model value was float, float round off error might happen.
// This method helps to eliminate the round off errors.

const isNumericValue = computed((): boolean => {
    return props.componentModel.type == 'float' || props.componentModel.type == 'int'
})

const numericValueRange = computed((): string => {
    if (isNumericValue.value) {

        const min = (props.componentModel as FloatParamType | IntParamType).min
        const max = (props.componentModel as FloatParamType | IntParamType).max
        if (props.componentModel.type == 'float' && props.componentModel.percentage) {
            return `[${min * 100}%, ${max * 100}%]`
        } else {
            return `[${min}, ${max}]`
        }
    } else {
        return ''
    }
})

// Check range for numeric values (int and float).
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

const originalValue = ref<any>(null)

const resetToOriginal = () => {
    if (props.modelValue != originalValue.value) {
        onValueChange(originalValue)
    } else {
        return
    }
}
onBeforeMount(() => {
    updateShownValue()
    originalValue.value = valueShown.value

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
    width: 100%;
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
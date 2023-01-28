<template>
    <div class="form-container">
        <el-alert v-if="paramsModified && showModifiedWarning" type="error" :closable="false"
            title="Warning: Parameters has changed, please reset the model.">
        </el-alert>
        <div label="名称" v-for="(item, index) in paramsModel" :key="index">

            <div v-if="item.type !== 'array'">
                <dynamic-form-item :label="item.label || item.name" :model-value="paramValues[index].value"
                    :component-model="item" @update:model-value="onUpdateSingleItem(index, $event)">
                </dynamic-form-item>
            </div>
            <dynamic-items-list v-else :params-model="item" :param-values="paramValues[index]"
                @update-value="onUpdate(index, $event)" :type="item.component"></dynamic-items-list>
        </div>
    </div>

</template>

<script lang="ts" setup>
import {defineProps, defineExpose, ref} from "vue"
import { ParamsType, ParamValuesType } from "./models"
import DynamicItemsList from "./DynamicItemsList.vue";
import DynamicFormItem from "./DynamicFormItem.vue";

defineProps({
    showModifiedWarning: {
        type: Boolean,
        default: true
    }
})
const paramsModel = ref<ParamsType[]>([])
const paramValues = ref<ParamValuesType>([])
const paramsModified = ref(false)
const onUpdate = (index: number, evt) => {

    paramValues.value[index] = evt
    updated()
}

const onUpdateSingleItem = (index: number, evt) => {
    paramValues.value[index].value = evt
    updated()
}

const updated = () => {
    paramsModified.value = true
}

const setupModels = (models) => {
    paramsModel.value = models
}

const setupValues = (values) => {
    paramValues.value = values
}

const getValues = () => {
    return paramValues.value
}

const setUnmodified = () => {
    paramsModified.value = false
}
defineExpose({ setupModels, setupValues, getValues, setUnmodified });
</script>

<style scoped>
.form-container {
    width: var(--form-width);
}
</style>
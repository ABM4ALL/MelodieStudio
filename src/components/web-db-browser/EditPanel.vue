<template>
    <el-dialog v-model="showStatus" :title="title">
        <dynamic-form :show-modified-warning="false" ref="dynamicForm">

        </dynamic-form>

        <el-button @click="finishEdit" style="margin-top: 12px;" type="primary">{{ $t("message.ok") }}</el-button>
        <el-button @click="showStatus = false" style="margin-top: 12px;">{{ $t("message.cancel") }}</el-button>
    </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, defineExpose, defineProps, PropType, defineEmits } from "vue"
import { ColumnScheme } from "./models"
import DynamicForm from "@/components/dynamicform/DynamicForm.vue"
import { useI18n } from 'vue-i18n'
import { FloatParamType, IntParamType, StringParamType, BoolParamType, ParamValuesType } from "@/components/dynamicform/models"
const { t } = useI18n()
const props = defineProps({
    recordColumns: {
        type: Array as PropType<ColumnScheme[]>,
        required: true
    },
    title: String
})
const showStatus = ref(false)
const emits = defineEmits<{ (e: 'record-value-change', value: Record<string, any>): void }>()
const dynamicForm = ref<InstanceType<typeof DynamicForm>>(null)

const setData = (formData: Record<string, any>) => {
    const formModels: Array<StringParamType> = []
    const data: ParamValuesType = []
    for (const item of props.recordColumns) {
        formModels.push(
            {
                name: item.name,
                type: item.type as "str",
                label: item.label,
                readonly: item.readonly
            }
        );
        data.push({
            name: item.name,
            type: item.type as "str",
            value: formData[item.name]
        })
    }
    dynamicForm.value.setupModels(formModels)
    dynamicForm.value.setupValues(data)
}

const finishEdit = () => {
    const values = dynamicForm.value.getValues()
    console.log(values)
    const record: Record<string, any> = {}
    for (const item of values) {
        record[item.name] = item.value
    }
    emits("record-value-change", record)
    showStatus.value = false
}

const show = () => {
    showStatus.value = true
}


defineExpose({ setData, show });
</script>
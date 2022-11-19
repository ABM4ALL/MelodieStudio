<template>
    <div class="form-container">
        <div v-if="paramsModel.component == 'panel'"
            style="display: flex; align-items: center; background-color: azure; margin-bottom: 12px;margin-top: 12px;">
            <el-popover>
                <template #reference>

                    <p class="sub-form-title" v-if="paramsModel.label !== ''">{{ paramsModel.label }}</p>
                </template>
                Description: {{ paramsModel.description }}
                <el-button @click="resetParams">Reset parameters</el-button>
            </el-popover>


            <el-select v-model="panelModeSelectorValue">
                <el-option :label="param.name" :value="param.name" v-for="param of paramsModel.children"
                    :key="param.name">
                </el-option>
            </el-select>
        </div>
        <div v-else>
            <p class="sub-form-title" v-if="paramsModel.label !== ''">{{ paramsModel.label }}</p>
        </div>


        <div v-for="(item, index) in paramsModel.children" :key="index">
            <div
                v-if="paramsModel.component == 'auto' || (paramsModel.component == 'panel' && item.name == panelModeSelectorValue)">
                <div v-if="paramValues.value[index] != null">
                    <div v-if="item.type !== 'array'">
                        <span v-if="debug">@{{ depth }}</span>
                        <dynamic-form-item class="dynamic-form-item" :label="item.label || item.name"
                            :model-value="paramValues.value[index].value" :component-model="item"
                            @update:model-value="onUpdateSingleItem(index, $event)" :ref="setItemRef">
                        </dynamic-form-item>
                    </div>
                    <dynamic-items-list v-else :depth="depth + 1" :paramsModel="item"
                        :paramValues="paramValues.value[index]" @update-value="onUpdateArrayItems(index, $event)">
                    </dynamic-items-list>
                </div>
                <div v-else>Error at paramValues: {{ JSON.stringify(paramValues) }}<br />
                    paramValues.value:{{ paramValues.value }}, <br />
                    index {{ index }}: paramValues.value[index] was null</div>
            </div>
            <div v-else v-show="debug">v-else triggered for{{ JSON.stringify(item) }}</div>

        </div>



    </div>

</template>

<script lang="ts" setup>
import { deepCopy } from "@/utils/utils";
import { defineProps, PropType, defineEmits, ref, onBeforeMount, watch, computed } from "vue"
import { ArrayParamsType, ArrayParamsValue, ParamsType, ParamValue } from "./models"
import DynamicFormItem from "./DynamicFormItem.vue";
const props = defineProps({
    paramsModel: {
        type: Object as PropType<ArrayParamsType>,
        required: true
    },
    paramValues: {
        type: Object as PropType<ParamValue>,
        required: true
    },
    type: {
        type: String as PropType<'auto' | 'panel'>
    },
    depth: {
        type: Number,
        default: 1
    }
})

const formItemRef = ref(null)
const itemRefs = [];
const setItemRef = (el: HTMLDivElement) => {
    itemRefs.push(el)
}

const children = computed(() => {
    let childrenCount = 0
    for (const paramModel of props.paramsModel.children) {
        if (paramModel.type != 'array') {
            childrenCount += 1
        }
    }
    return childrenCount
})
const emits = defineEmits(['update-value'])
const debug = false
const onUpdateArrayItems = (index: number, evt: ArrayParamsValue) => {
    const newObj: ParamValue = deepCopy(props.paramValues);
    newObj.value[index] = evt
    emits('update-value', newObj)
}
const onUpdateSingleItem = (index: number, evt: any) => {
    const newObj: ParamValue = deepCopy(props.paramValues);
    (newObj.value[index] as ParamValue).value = evt
    emits('update-value', newObj)
}

const panelModeSelectorValue = ref("")
const originalValues = []

const resetParams = () => {
    for (const item of itemRefs) {
        const f = (item as any).resetToOriginal
        if (f != null) {
            f()
        }
    }
}
onBeforeMount(() => {
    if (props.paramsModel.children.length > 0) {
        panelModeSelectorValue.value = props.paramsModel.children[0].name
    }
})


</script>

<style scoped>
.form-container {
    width: var(--form-width);
}

.sub-form-title {
    font-size: 18px;
    margin-top: 0px;
    margin-bottom: 0px;
    min-width: var(--label-width);
    max-width: var(--label-width);
}
</style>
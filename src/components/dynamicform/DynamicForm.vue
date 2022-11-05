<template>
  <drag-container :slotComponentID="'visualizer-' + item.name" class="slider-demo-block" v-for="(item, index) in inputModels"
    :key="index">

    <span class="demonstration">{{ item.name }}</span>
    <el-slider v-model="inputValues[item.name].value" v-if="item.type === 'number'" :min="item.min" :max="item.max"
      :step="item.step" @change="onSliderMove"></el-slider>
    <div v-if="item.type === 'selection'">
      <el-select v-model="inputValues[item.name].value" placeholder="Select" v-if="item.selections.length > 3">
        <el-option v-for="item in item.selections" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-radio-group v-model="inputValues[item.name].value" v-else>
        <el-radio :label="selection" v-for="(selection, i) in item.selections" :key="i">{{ selection }}</el-radio>
      </el-radio-group>
    </div>
    <div v-if="item.type === 'boolean'">
      <el-switch v-model="inputValues[item.name].value"></el-switch>
    </div>

    <el-alert v-if="paramsModified" type="error" :closable="false"
      title="Warning: Parameters has changed, please reset the model.">
    </el-alert>
    <!-- </div> -->
  </drag-container>
</template>

<script lang="ts">

import DragContainer from "@/components/basic/DragContainer.vue";
import { ref, defineComponent, PropType } from "vue";

export interface ParamType {
  name: string;
  type: string;
}

export interface NumberParamType extends ParamType {
  min: number;
  max: number;
  step: number;
}

export interface SelectionParamType extends ParamType {
  selections: Array<number | string>;
  tags: Array<string>;
}

// Type for complex nested object with dynamic key
// link: https://stackoverflow.com/questions/39256682/how-to-define-an-interface-for-objects-with-dynamic-keys
export interface InitialParams {
  [key: string]: { value: number | string | boolean };
}

export interface ParamsData {
  paramModels: Array<ParamType | NumberParamType | SelectionParamType>;
  initialParams: InitialParams;
}

export default defineComponent({
  components: { DragContainer },
  props: {
    interactiveParams: Object as PropType<ParamsData>,
    paramsModified: Boolean as PropType<boolean>,
  },
  data() {
    // const inputModels: (ParamType | NumberParamType | SelectionParamType)[] = [
    //   { name: "a", type: "number", max: 99.9, min: 0.34, step: 0.3 },
    //   { name: "b", type: "selection", selections: [0, 1, 2] },
    //   { name: "c", type: "selection", selections: [0, 1, 2, 3, 4, 5] },
    //   { name: "d", type: "boolean" },
    // ];
    let inputValues = {
      // reliability: { value: ref(0.9) },
      // recover_rate: { value: ref(0.8) },
    };
    const formatTooltip = (val) => {
      return val / 100;
    };

    return {
      // paramsModified:
      // inputModels,
      inputValues,
      formatTooltip,
    };
  },
  computed: {
    inputModels: function (this: any) {
      if (this.interactiveParams === undefined) {
        return;
      }
      return this.interactiveParams.paramModels;
    },
  },
  watch: {
    interactiveParams: function (this: any) {
      for (let i = 0; i < this.interactiveParams.initialParams.length; i++) {
        let param = this.interactiveParams.initialParams[i];
        param.value = ref(param.value);
      }
      this.inputValues = this.interactiveParams.initialParams;
    },
    inputValues: {
      deep: true,
      handler: function (this: any) {
        this.$emit("param-changed", this.inputValues);
      },
    },
  },
  methods: {
    onSliderMove(v) {
      // console.log(this.inputValues.a.value, this.inputValues.b.value, v);
      this.getValues();
    },
    getValues() {
      for (let i = 0; i < this.inputModels.length; i++) {
        console.log(
          this.inputModels[i].name,
          this.inputValues[this.inputModels[i].name].value
        );
      }
    },
  },
});
</script>

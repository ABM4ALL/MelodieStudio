<template>
  <div class="mld-sheet-selector-outer">
    <el-select
      :model-value="currentSheet"
      @update:model-value="onValueChange($event)"
    >
      <el-option
        v-for="item in sheetNames"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, defineEmits } from "vue";
const props = defineProps({
  sheetNames: {
    type: Array as PropType<string[]>,
    required: true,
  },
  currentSheet: { type: String, required: true },
});

const emits = defineEmits(["sheet-selected"]);

const onValueChange = (evt: string) => {
  emits("sheet-selected", evt);
};
</script>

<style>
.mld-sheet-selector-outer {
  display: flex;
}
</style>

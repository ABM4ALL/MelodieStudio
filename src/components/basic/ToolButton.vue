<template>
  <el-button
    @click="onClick"
    @mousedown="onToolbuttonMouseDown"
    :disabled="disabled"
  >
    <el-icon v-if="icon != null">
      <!-- <component :is="icon"> </component> -->
      <svg-icon :svgIconName="icon"></svg-icon>
    </el-icon>
    {{ text }}</el-button
  >
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import SvgIcon from "./SvgIcon.vue";
const props = defineProps({
  /* If true, click this button will not let the previously focused component blur.*/
  notUnblurOther: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
});

const emits = defineEmits(["click"]);
const onClick = (evt: PointerEvent) => {
  emits("click", evt);
};
const onToolbuttonMouseDown = (evt: PointerEvent) => {
  if (props.notUnblurOther) {
    evt.preventDefault();
  }
};
</script>

<style></style>

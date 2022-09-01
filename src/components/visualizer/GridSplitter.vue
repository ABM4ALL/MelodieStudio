<template>
  <div class="splitter" :style="positionStr"></div>
</template>

<script lang="ts" setup>
import { computed, defineProps, PropType } from "vue";
const props = defineProps({
  direction: {
    type: String as PropType<"vertical" | "horizontal">,
    required: true,
  },
  position: Number,
});

const positionStr = computed(() => {
  if (props.direction === "vertical") {
    return `left: ${props.position}px; width:1px; height:100%`;
  } else {
    return `top: ${props.position}px; height:1px; width:100%`;
  }
});
</script>

<style>
.splitter {
  position: absolute;
  background: var(--splitter-color);
  border: 0px;
  z-index: var(--splitter-z-index);
}
</style>
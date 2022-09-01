<template>
  <div
    class="agent"
    :style="{
      backgroundColor: agentStyle.backgroundColor,
      zIndex: zIndex,
      left: agentStyle.left + 'px',
      top: agentStyle.top + 'px',
      width: agentStyle.width + 'px',
      height: agentStyle.height + 'px',
    }"
  >
    <span v-if="agentStyle.text != null">{{ agentStyle.text }}</span>
    <img
      v-if="agentStyle.image != null"
      :src="agentStyle.image"
      :style="{
        width: agentStyle.width + 'px',
        height: agentStyle.height + 'px',
        zIndex: 100,
      }"
      :type="imgType"
    />
  </div>
</template>

<script lang="ts" setup>
import Image from "@/views/Image.vue";
import { computed, defineProps, PropType } from "vue";
const props = defineProps({
  agentStyle: {
    type: Object as PropType<{
      backgroundColor: string;
      text: string;
      image: string;
      left: number;
      top: number;
      width: number;
      height: number;
    }>,
  },
  role: {
    type: String as PropType<"agent" | "spot">,
  },
  data: {
    type: Object,
  },
});

const zIndex = computed(() => {
  return props.role == "agent" ? 20 : 10;
});

const imgType = computed(() => {
  switch (props.agentStyle?.image.split(".")[1]) {
    case "png": {
      return "image/png";
    }
    default: {
      console.error("Unrecognized img type for " + props.agentStyle?.image);
      return "image/png";
    }
  }
});
</script>

<style scoped>
.agent {
  position: absolute;
  border: 0px;
  z-index: var(--agent-z-index);
}
</style>
<template>
  <drag-container
    @container-changed="onContainrerLayoutChanged"
    :slotComponentID="'visualizer-' + name"
  >
    <div class="grid-component-container">
      <grid-splitter
        :position="splitter.position"
        :direction="splitter.direction"
        v-for="(splitter, i) in splitters"
        :key="i"
      ></grid-splitter>
      <transition-group
        class="agent-transition-group"
        :style="{ '--transition-time': transitionTime + 's' }"
        tag="div"
      >
        <agent
          v-for="agent in agents"
          :key="agent.data.id"
          role="agent"
          :agent-style="{
            backgroundColor: agent.style.backgroundColor,
            left: (agent.data.x * width) / columns,
            top: (agent.data.y * height) / rows,
            width: width / columns,
            height: height / rows,
            image: agent.style.image,
          }"
          :data="agent.data"
        ></agent>
      </transition-group>
      <agent
        v-for="spot in spots"
        :key="spot.data.id"
        role="spot"
        :agent-style="{
          backgroundColor: spot.style.backgroundColor,
          left: (spot.data.x * width) / columns,
          top: (spot.data.y * height) / rows,
          width: width / columns,
          height: height / rows,
          image: spot.style.image,
        }"
        :data="spot"
      ></agent>
    </div>
  </drag-container>
</template>

<script lang="ts" setup>
import DragContainer from "@/components/basic/DragContainer.vue";
import {
  computed,
  nextTick,
  onMounted,
  ref,
  defineProps,
  watch,
} from "vue-demi";
import { GridItem } from "@/models/agents";
import GridSplitter from "./GridSplitter.vue";
import Agent from "./AgentComponent.vue";
import { NewVisualizerData } from "@/models/visualizerbasics";
import { PropType } from "vue";
const props = defineProps({
  name: String,
  columns: {
    type: Number,
    default: 100,
  },
  rows: {
    type: Number,
    default: 100,
  },
  desiredFPS: {
    type: Number,
  },
  visualizerData: {
    type: Object as PropType<NewVisualizerData>,
  },
});

const width = ref(0);
const height = ref(0);

const onContainrerLayoutChanged = (newLayout: {
  left: number;
  top: number;
  width: number;
  height: number;
}) => {
  if (width.value == newLayout.width && height.value == newLayout.height) {
    return;
  } else {
    width.value = newLayout.width;
    height.value = newLayout.height;
  }
};

const splitters = computed(() => {
  const splitterArr: {
    position: number;
    direction: "horizontal" | "vertical";
  }[] = [];
  for (let i = 0; i <= props.columns; i++) {
    splitterArr.push({
      position: i * (width.value / props.columns),
      direction: "vertical",
    });
  }
  for (let i = 0; i <= props.rows; i++) {
    splitterArr.push({
      position: i * (height.value / props.rows),
      direction: "horizontal",
    });
  }
  return splitterArr;
});

const transitionTime = computed(() => {
  if (props.desiredFPS == null) {
    return "unset";
  }
  if (props.desiredFPS <= 5) {
    return (1 / props.desiredFPS) * 0.8;
  } else {
    return 0;
  }
});

const spots = computed(() => {
  return props.visualizerData?.spots;
});
const agents = computed(() => {
  return props.visualizerData?.agents;
});
</script>

<style scoped>
.grid-component-container {
  position: relative;
  width: 100%;
  height: 100%;
  --theme: green;
  --splitter-color: black;
  --spot-color: orange;

  --spot-z-index: 10;
  --splitter-z-index: 15;
  --agent-z-index: 20;
}
.v-move {
  transition: var(--transition-time);
}
</style>
<template>
  <el-row type="flex" align="middle">
    <el-button-group>
      <el-tooltip content="Reset Model">
        <el-button @click="$emit('reset')">
          <el-icon><refresh /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="Next step">
        <el-button @click="$emit('step')">
          <svg
            t="1647329042360"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="3868"
            width="20"
            height="18"
            style="fill: #606266"
          >
            <path
              d="M676.409 528.95l-383.21 301.024C278.95 841.166 258 831.078 258 813.024v-602.05c0-18.05 20.95-28.14 35.199-16.948l383.21 301.023c11.01 8.65 11.01 25.252 0 33.901M694 864h64a8 8 0 0 0 8-8V168a8 8 0 0 0-8-8h-64a8 8 0 0 0-8 8v688a8 8 0 0 0 8 8"
              p-id="3869"
            ></path>
          </svg>
        </el-button>
      </el-tooltip>
      <el-tooltip content="Loop forward">
        <el-button @click="$emit('loop')">
          <el-icon>
            <video-play />
          </el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="Pause">
        <el-button @click="$emit('pause')">
          <el-icon>
            <video-pause />
          </el-icon>
        </el-button>
      </el-tooltip>
    </el-button-group>

    <p style="margin-left: 14px">steps:{{ currentStep }}</p>
    <div style="margin-left: 14px; width: 300px">
      <el-slider v-model="value" :max="30" :min="1" :step="1" />
    </div>
    <div style="margin-left: 14px">
      <el-tag type="success" v-if="connected">Connected</el-tag>
      <el-tag type="danger" v-if="!connected">Disconnected</el-tag>
    </div>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  emits: ["reset", "step", "loop", "pause", "fps-limit-change"],
  props: {
    connected: {
      type: Boolean,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      value: 10,
    };
  },
  watch: {
    value(this: any) {
      this.$emit("fps-limit-change", this.value);
    },
  },
  mounted() {
    this.$emit("fps-limit-change", this.value);
  },
});
</script>

<style>
</style>
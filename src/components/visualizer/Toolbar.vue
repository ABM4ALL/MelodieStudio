<template>
  <el-row type="flex" align="middle">

    <el-button-group>
      <slot name="left-items">

      </slot>
      <el-tooltip content="Reset Model">
        <el-button @click="$emit('reset')">
          <el-icon>
            <refresh />
          </el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="Next step">
        <el-button @click="$emit('step')">
          <svg t="1647329042360" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="3868" width="20" height="18" style="fill: #606266">
            <path
              d="M676.409 528.95l-383.21 301.024C278.95 841.166 258 831.078 258 813.024v-602.05c0-18.05 20.95-28.14 35.199-16.948l383.21 301.023c11.01 8.65 11.01 25.252 0 33.901M694 864h64a8 8 0 0 0 8-8V168a8 8 0 0 0-8-8h-64a8 8 0 0 0-8 8v688a8 8 0 0 0 8 8"
              p-id="3869"></path>
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
    <div style="margin-left: 14px; width: 300px" v-show="store.state.status.developmentMode">
      <el-slider v-model="value" :max="20" :min="1" :step="1" />
    </div>
    <el-tooltip :content="`Visualization host at ${wsHost}`">
      <div style="margin-left: 14px" @click="connectionEditDialogShow = true">
        <el-tag type="success" v-if="connected">Ready</el-tag>
        <el-tag type="danger" v-if="!connected">Disconnected</el-tag>
      </div>
    </el-tooltip>

    <div style="flex-grow: 1"></div>
    <div style="margin-right: 48px" class="right-items">
      <slot name="right-items">
      </slot>
    </div>

  </el-row>
  <el-dialog v-model="connectionEditDialogShow" title="Edit Connection to Visualization Host" width="30%" :append-to-body="true">
    <el-autocomplete v-model="newWSHost" :fetch-suggestions="querySearchAsync" placeholder="Please input"
      @select="handleSelect" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="connectionEditDialogShow = false">Cancel</el-button>
        <el-button type="primary" @click="onWSHostChange">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import store from "@/store"
import { getAllVisualizerHosts } from "@/api/visualizer";
export default defineComponent({
  emits: ["reset", "step", "loop", "pause", "fps-limit-change", 'ws-host-change'],
  props: {
    connected: {
      type: Boolean,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
    wsHost: {
      type: String,
      required: true
    }
  },
  setup() {
    return {
      store
    }
  },
  data() {
    return {
      value: 3,
      connectionEditDialogShow: false,
      newWSHost: this.wsHost
    };
  },
  methods: {
    onWSHostChange() {
      this.$emit('ws-host-change', this.newWSHost)
    },
    async querySearchAsync(queryString: string, cb: (arg: any) => void) {
      const data: string[] = await getAllVisualizerHosts()
      const results = queryString
        ? data.filter((s) => s.includes(queryString))
        : data
      const newResult: { value: string }[] = []
      for (const item of results) {
        newResult.push({
          value: item
        })
      }
      cb(newResult)
    }, handleSelect(item) {
      console.log(item)
    }
  },
  watch: {
    value(this: any) {
      this.$emit("fps-limit-change", this.value);
    },
    wsHost(this: any) {
      this.newWSHost = this.wsHost;
    }
  },
  mounted() {
    this.$emit("fps-limit-change", this.value);
  },
});
</script>

<style scoped>
.right-items {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}
</style>
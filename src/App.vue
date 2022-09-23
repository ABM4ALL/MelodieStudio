<template>
  <div>
    <router-view v-if="$route.path === '/studio-main'"></router-view>
    <layout v-else></layout>
  </div>
</template>
<script lang="ts">
import layout from "@/layout/index.vue";
import { getProjectMeta } from "@/api/fs";
import store from "./store";
import { registerEvents } from "@/components/events/globalevents";
registerEvents();
export default {
  setup() {
    getProjectMeta().then((meta) => {
      store.commit("SET_PROJECT_META", meta);
    });
    return {};
  },
  components: {
    layout,
  },
};
</script>
<style lang="less">
@import "@/style/variable.less";
body {
  margin: 0;
}
#app {
  min-width: 800px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  .el-button--primary {
    background: @menuActiveText; // button 主题色保持一致
    border-color: @menuActiveText;
  }
}
</style>

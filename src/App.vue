<template>
  <div style="height: 100vh; width: 100vw">
    <router-view
      v-if="$route.path === '/studio-main' || $route.path === '/full-page-visualizer' || $route.path === '/' || $route.path === '/welcome'">
    </router-view>
    <layout v-else></layout>
    <Drawer></Drawer>
  </div>
</template>
<script lang="ts">
import Drawer from "@/layout/components/Drawer/index.vue"
import layout from "@/layout/index.vue";
import { getProjectMeta } from "@/api/fs";
import store from "./store";
import { registerEvents } from "@/components/events/globalevents";
import defaultRoutes from "./router/defaultRoutes";
import { defineComponent } from "vue";
registerEvents();
export default defineComponent({
  setup() {
    getProjectMeta().then((meta) => {
      store.commit("SET_PROJECT_META", meta);
    });
    return {};
  },
  components: {
    layout,
    Drawer
  },
  computed: {
    // Tell if the route is on root.
    // The route root occupies the whole page.
    isRootRoute() {
      return defaultRoutes.findIndex((route) => route.path == this.$route.path) != -1
    }
  }
});
</script>
<style>
#app {
  height: 100vh;
}

html {
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
}

body {
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
}
</style>

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

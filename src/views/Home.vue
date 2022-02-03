<template>
  <div class="home">
    <h2>Welcome to Melody Studio!</h2>
    <div>
      <p>
        Melody Studio is a web-based toolbox for agent-based modelling together with Melodie. Now
        MelodyStudio has integrated the following functions:
      </p>
      <li>
        <el-button @click="jumpToInner('tools/dbBrowser')"
          >Database Browser</el-button
        > to browse your database.
      </li>
      <li>
        <el-button @click="jumpToInner('tools/projectCreator')"
          >Project Creator</el-button
        > to create a new project from a template.
      </li>
      <p>Happy Modelling!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, provide } from "vue";
import variable from "@/style/variable.less";
// import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import { useRouter } from "vue-router";
import { useTheme } from "@/composition/useThemeApi";

import request from "@/request/index.js";
export default {
  setup() {
    const themeApi = useTheme();
    const router = useRouter();
    let variables = reactive(variable);
    const envName = reactive({ title: process.env.VUE_APP_TITLE });
    const mockData = reactive({ data: {} });
    function jumpToInner(path: string) {
      router.push({
        path: `/${path}`,
      });
    }
    function loadData() {
      request.get("http://localhost:3001/api/wans").then((data: any) => {
        console.log(data, "ddasd");
        mockData.data = data.result;
      });
    }
    provide("obj", envName); // 向子孙组件传递参数

    return {
      envName,
      variables,
      themeApi,
      jumpToInner,
      loadData,
      mockData,
    };
  },
  // components: {
  //   HelloWorld
  // }
};
</script>
<style lang="less">
.home {
  // text-align: center;
  line-height: 24px;
}
.height {
  height: 999px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

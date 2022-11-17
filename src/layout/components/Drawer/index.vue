<template>
  <div>
    <div class="fixd" @click="openDrawer()">
      <el-icon>
        <setting></setting>
      </el-icon>
    </div>
    <el-drawer v-model="drawer" size="20%" :with-header="false">
      <div class="router-column">
        <p>Melodie Router</p>
        <el-button @click="$router.push('/')">Composite Workspace</el-button>
        <el-button @click="$router.push('/full-page-visualizer')">Full page visualizer</el-button>
        <el-button @click="$router.push('/home')">Home</el-button>
        <el-form>
          <el-form-item label="Dev Mode">
            <el-switch :model-value="store.state.status.developmentMode"
              @update:modelValue="store.commit('SET_DEVELOPMENT_MODE', $event)"></el-switch>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "@/composition/useThemeApi";
import { Setting } from "@element-plus/icons-vue"
import store from "@/store"
export default {
  setup() {
    let drawer = ref(false);
    const router = useRouter();
    const themeApi = useTheme();
    const themeType = reactive({
      themeArr: [
        "#FFFFFF",
        "#999EFF",
        "#1890ff",
        "#304156",
        "#212121",
        "#11a983",
        "#13c2c2",
        "#6959CD",
        "#f5222d",
      ],
    });
    function openDrawer() {
      drawer.value = !drawer.value;
    }
    function activeChange() {
      console.log(123);
    }

    const logout = () => {
      localStorage.removeItem("user");
      router.push("/login");
    };
    return {
      drawer,
      openDrawer,
      themeApi,
      activeChange,
      themeType,
      logout,
      Setting,
      store
    };
  },
};
</script>
<style lang="less" scoped>
.fixd {
  border: 1px solid #ddd;
  position: fixed;
  right: 10px;
  top: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  opacity: 0.6;
  cursor: pointer;

  .el-icon-setting {
    font-size: 24px;
    color: #aaa;
  }
}

.title {
  font-size: 16px;
  padding: 20px;
  text-align: center;
}

.content {
  padding: 10px;

  >div {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
}

.theme-title {
  font-size: 16px;
}

.theme-type {
  width: 14px;
  height: 14px;
  display: inline-block;
  cursor: pointer;
  margin-right: 5px;
  border: 1px solid #eee;
}

.router-column {
  display: flex;
  flex-direction: column;
  width: 100%;

  .el-button {
    margin-left: 0px !important;
  }
}
</style>
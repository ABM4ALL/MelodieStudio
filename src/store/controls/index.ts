import { staticRoutes } from '../../router/staticRoutes';
export default {
  state: {
    isCollapse: false, // 控制菜单展开与折叠
    staticRoutes: staticRoutes,
    os: "",
    cwd: "",
    interpreterMeta: { executable: "" },
  },
  mutations: {
    TOOGLESIDEBAR(state: any) {
      state.isCollapse = !(state.isCollapse);
    },
    SET_PROJECT_META(state, meta) {
      state.cwd = meta.cwd;
      state.interpreterMeta.executable = meta.executable;
      state.os = meta.os;
    },
  },
  actions: {
  },
  getters: {
  },
  modules: {
  }
};

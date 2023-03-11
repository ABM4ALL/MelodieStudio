import Wrapper from '@/layout/components/Wrapper/index.vue';
import Database from "@/views/Database.vue";
// import DynamicFormNew from 

/**
 * 
 * 路由配置规则：
 * 
 * {
 *  path:'',路径
 *  name:'',路由名称，生成menu时menu name
 *  meta:{},额外信息，icon为menu中的icon
 *  children: [], 子路由，menu中的子menu 没有时可为空数组
 * }
 * 
 */


export const staticRoutes = [
  {
    path: '/',
    name: 'Main',
    // component: Home,
    children: [],
    meta: {
      icon: 'home-filled',
      title: "Melody Studio"
    },
    // redirect: "/studio-main"
    redirect: "/full-page-visualizer"
  },

  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    children: [],
    meta: {
      icon: 'home-filled',
      title: "Melody Studio"
    },
  },
  {
    path: '/visualizer',
    name: 'Visualizer',
    component: () => import("@/views/Visualizer.vue"),
    children: [],
    meta: {
      icon: 'view'
    }
  },
  {
    path: '/network',
    name: 'Network',
    component: () => import('@/components/network/NetworkViewerNew.vue'),
    children: [],
    meta: {
      icon: 'el-icon-s-home'
    }
  }, {
    path: '/visual-programming',
    name: 'VisualProgramming',
    component: () => import('@/components/visual_programming/VisualProgramming.vue'),
    children: [],
    meta: {
      icon: 'el-icon-s-home'
    }
  },  {
    path: '/state-diagram',
    name: 'StateDiagram',
    component: () => import('@/components/flowchart/Flowchart.vue'),
    children: [],
    meta: {
      icon: 'el-icon-s-home'
    }
  }, 
  // {
  //   path: '/blockly-canvas',
  //   name: 'BlocklyCanvas',
  //   component: () => import('@/components/blockly/BlocklyCanvas.vue'),
  //   children: [],
  //   meta: {
  //     icon: 'el-icon-s-home'
  //   }
  // },
  // {
  //   path: '/chartList',
  //   name: 'ChartListView',
  //   component: ChartListView,
  //   children: [],
  //   meta: {
  //     icon: 'el-icon-s-home'
  //   }
  // },
  {
    path: '/tools',
    name: 'Tools',
    component: Wrapper,
    meta: {
      icon: "tools"
    },
    children: [
      {
        path: 'dbBrowser',
        name: 'DB Browser',
        component: Database,
        children: [],
        meta: {
          icon: 'coin',
          keepAlive: true
        }
      },
      {
        path: 'form-demo',
        name: 'Form demo',
        // eslint-disable-next-line
        // @ts-ignore
        component: () => import("@/components/dynamicform/DynamicForm.vue"),
        children: [],
        meta: {
          icon: 'coin',
          keepAlive: true
        }
      },
      {
        path: 'visualizer2',
        name: 'GridNew',
        component: () => import('@/components/visualizer/GridComponent.vue'),
        children: [],
        meta: {
          icon: 'magic-stick',
          KeepAlive: true,
        }
      },
      {
        path: 'cythonEditor2',
        name: 'CodeEditor',
        component: () => import('@/components/editor/CodeEditor.vue'),
        children: [],
        meta: {
          icon: 'magic-stick',
          keepAlive: true,
        }
      },
      {
        path: 'term',
        name: 'Terminal',
        component: () => import('@/components/terminal/TerminalView.vue'),
        children: [],
        meta: {
          icon: 'magic-stick'
        }
      }, {
        path: '/threejs',
        name: 'ThreeJS',
        component: () => import('@/components/network/ThreejsViewer.vue'),
        children: [],
        meta: {
          icon: 'el-icon-s-home'
        }
      },
    ],
  },
];

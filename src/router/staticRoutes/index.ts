import Wrapper from '@/layout/components/Wrapper/index.vue';
import Home from '@/views/Home.vue';
import GridShow from "@/views/GridShow.vue";
import Database from "@/views/Database.vue";
// import ProjectCreator from "@/components/projectcreator/ProjectCreator.vue";
// import CythonEditor from '@/editor/CythonEditor.vue';
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
    name: 'Home',
    component: Home,
    children: [],
    meta: {
      icon: 'home-filled',
      title: "Melody Studio"
    }
  },
  {
    path: '/visualizer',
    name: 'Visualizer',
    component: GridShow,
    children: [],
    meta: {
      icon: 'view'
    }
  },
  //  {
  //   path: '/grid',
  //   name: 'Grid',
  //   component: GridShow,
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
          icon: 'coin'
        }
      },
      // {
      //   path: 'projectCreator',
      //   name: 'New Project ...',
      //   component: ProjectCreator,
      //   children: [],
      //   meta: {
      //     icon: 'magic-stick'
      //   }
      // }, 
      {
        path: 'visualizer2',
        name: 'GridNew',
        component: () => import('@/components/visualizer/GridComponent.vue'),
        children: [],
        meta: {
          icon: 'magic-stick'
        }
      },
      {
        path: 'cythonEditor2',
        name: 'Editor',
        component: () => import('@/editor/CodeEditor.vue'),
        children: [],
        meta: {
          icon: 'magic-stick'
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
      }
    ],
  },
  {
    path: '/doc',
    name: 'Documentations',
    redirect: '/doc/doctext',
    component: Wrapper,
    meta: {
      icon: 'document'
    },

    children: [
      {
        path: 'doctext',
        name: 'Text',
        component: Wrapper,
        meta: {
          icon: 'el-icon-s-data'
        },
        children: []
        // children: [
        //   {
        //     path: 'doctxtooo',
        //     name: '文本1',
        //     component: Wrapper,
        //     meta: {
        //       icon: ''
        //     },
        //     children: [
        //       {
        //         path: 'docimg1',
        //         name: '文本内容',
        //         component: Image,
        //         children: [],
        //         meta: {
        //           icon: ''
        //         }
        //       }
        //     ]
        //   },
        //   {
        //     path: 'doctxtiii',
        //     name: '文本2',
        //     component: Document,
        //     children: [],
        //     meta: {
        //       icon: ''
        //     }
        //   }
        // ]
      },
      // {
      //   path: 'docimg',
      //   name: '图像',
      //   component: Image,
      //   children: [],
      //   meta: {
      //     icon: 'el-icon-camera'
      //   }
      // }
    ]
  },
];

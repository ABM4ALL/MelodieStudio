import Wrapper from '@/layout/components/Wrapper/index.vue';
import Home from '@/views/Home.vue';
import Document from '@/views/Document.vue';
import Tab from '@/views/Tab.vue';
import Image from '@/views/Image.vue';
import Button from '@/views/Button.vue';
import Date from '@/views/Date.vue';
import Component from '@/views/Component.vue';
import NetworkShow from "@/views/NetworkShow.vue";
import GridShow from "@/views/GridShow.vue";
import ChartListView from "@/views/ChartListView.vue";
import Database from "@/views/Database.vue";
import ProjectCreator from "@/components/projectcreator/ProjectCreator.vue";
import ThreeVisualizer from "@/views/ThreeVisualizer.vue";
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
      icon: 'el-icon-s-home',
      title: "Melody Studio"
    }
  },
  {
    path: '/visualize',
    name: 'Visualize',
    component: NetworkShow,
    children: [],
    meta: {
      icon: 'el-icon-s-home'
    }
  }, {
    path: '/grid',
    name: 'Grid',
    component: GridShow,
    children: [],
    meta: {
      icon: 'el-icon-s-home'
    }
  },
  {
    path: '/chartList',
    name: 'ChartListView',
    component: ChartListView,
    children: [],
    meta: {
      icon: 'el-icon-s-home'
    }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Wrapper,
    children: [
      {
        path: 'dbBrowser',
        name: 'DB Browser',
        component: Database,
        children: [],
        meta: {
          icon: ''
        }
      },
      {
        path: 'projectCreator',
        name: 'New Project ...',
        component: ProjectCreator,
        children: [],
        meta: {
          icon: ''
        }
      }
    ],
    meta: {
      icon: 'el-icon-s-home'
    }
  },
  // {
  //   path: '/threejs-test',
  //   name: 'Threejs',
  //   component: ThreeVisualizer,
  //   children: [],
  //   meta: {
  //     icon: 'el-icon-s-home'
  //   }
  // },
  {
    path: '/doc',
    name: 'Documentations',
    redirect: '/doc/doctxt',
    component: Wrapper,
    meta: {
      icon: 'el-icon-s-order'
    },

    children: [
      {
        path: 'doctxt',
        name: 'Text',
        component: Wrapper,
        meta: {
          icon: 'el-icon-s-data'
        },
        children: [
          {
            path: 'doctxtooo',
            name: '文本1',
            component: Wrapper,
            meta: {
              icon: ''
            },
            children: [
              {
                path: 'docimg1',
                name: '文本内容',
                component: Image,
                children: [],
                meta: {
                  icon: ''
                }
              }
            ]
          },
          {
            path: 'doctxtiii',
            name: '文本2',
            component: Document,
            children: [],
            meta: {
              icon: ''
            }
          }
        ]
      },
      {
        path: 'docimg',
        name: '图像',
        component: Image,
        children: [],
        meta: {
          icon: 'el-icon-camera'
        }
      }
    ]
  },
];

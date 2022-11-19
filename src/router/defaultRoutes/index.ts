import Inner from "@/views/Inner.vue";
import NotFound from '@/views/NotFound.vue';
const defaultRoutes: any = [
  {
    path: "/inner",
    name: "内部页面",
    component: Inner,
    meta: {
      activePath: '/'  // 打开非Menu页面选择当前激活menu
    }
  },{
    path: "/studio-main",
    name: "studio-main",
    component:  () => import('@/components/mainpanel/MainPage.vue'),
    // meta: {
    //   activePath: '/'  // 打开非Menu页面选择当前激活menu
    // }
  },{
    path: "/full-page-visualizer",
    name: "full-page-visualizer",
    component:  () => import('@/views/Visualizer.vue'),
    // meta: {
    //   activePath: '/'  // 打开非Menu页面选择当前激活menu
    // }
  },{
    path: "/welcome",
    name: "welcome",
    component:  () => import('@/views/Welcome.vue'),
    // meta: {
    //   activePath: '/'  // 打开非Menu页面选择当前激活menu
    // }
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: NotFound
  }
];

export default defaultRoutes;

import Inner from "@/views/Inner.vue";
import NotFound from '@/views/NotFound.vue';
const defaultRoutes: { path: string, name: string, component: any, meta?: any }[] = [
  {
    path: "/inner",
    name: "内部页面",
    component: Inner,
    meta: {
      activePath: '/'
    }
  },
  {
    path: "/studio-main",
    name: "studio-main",
    component: () => import('@/components/mainpanel/MainPage.vue'),
  },
  {
    path: "/full-page-visualizer",
    name: "full-page-visualizer",
    component: () => import('@/views/Visualizer.vue'),
  },
  {
    path: "/welcome",
    name: "welcome",
    component: () => import('@/views/Welcome.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: NotFound
  }
];

export default defaultRoutes;

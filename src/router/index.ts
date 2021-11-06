import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { staticRoutes } from './staticRoutes';
import defaultRoutes from './defaultRoutes';

const routes: any = staticRoutes.concat(defaultRoutes);

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  next();
});
export default router;

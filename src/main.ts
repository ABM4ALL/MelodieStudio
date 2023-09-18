import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/lib/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import customDirectives from "./custom-directives"
import { i18n } from "@/utils/i18n"
const app = createApp(App);
customDirectives(app)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
   app.component(key, component)
}
app.use(i18n)
// app.use(store).use(router).use(ElementPlus, { locale }).mount('#app');
app.use(store).use(router).mount('#app');

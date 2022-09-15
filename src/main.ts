import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/lib/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import request from "@/request/index";
import * as ws from "@/api/ws"
console.log(ws)

// 这里监听请求的错误统一处理（做弹窗提示提示）
request.on("HttpStatusFaild", () => {
   // console.log("Capture status");
   alert("Request failed, please check the interface.");
});
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
   app.component(key, component)
}

app.use(store).use(router).use(ElementPlus, { locale }).mount('#app');

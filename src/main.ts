import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import locale from 'element-plus/lib/locale/lang/zh-cn';
// import 'bootstrap-icons';
import request from "@/request/index";
import * as ElIcons from '@element-plus/icons';
// 这里监听请求的错误统一处理（做弹窗提示提示）
request.on("HttpStatusFaild", () => {
   // console.log("Capture status");
   alert("Request failed, please check the interface.");
});
const app = createApp(App);
for (const name in ElIcons) {
   app.component(name, (ElIcons as any)[name]);
}

app.use(store).use(router).use(ElementPlus, { locale }).mount('#app');

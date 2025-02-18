import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css';
import '@fortawesome/fontawesome-free/css/all.css';
import axios from './plugins/axios';

const app = createApp(App);
app.use(store);
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});

// 全局配置
app.config.globalProperties.$axios = axios;

app.mount("#app");

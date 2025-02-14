import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import "./style.css";
import App from "./App.vue";

// 创建vue实例
const app = createApp(App);

// 国际化配置
app.use(ElementPlus, {
	locale: zhCn,
});

// element-plus 全局配置
app.use(ElementPlus, { size: "default", zIndex: 3000 });

app.mount("#app");

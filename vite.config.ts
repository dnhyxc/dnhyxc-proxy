import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			resolvers: [ElementPlusResolver()],
		}),
		Components({
			resolvers: [ElementPlusResolver()],
		}),
		ElementPlus({}),
	],
	resolve: {
		// 设置别名
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		// 忽略后缀名的配置选项, 添加 .vue 选项时要记得原本默认忽略的选项也要手动写入
		extensions: [".js", ".ts", ".json", ".vue"],
	},
	build: {
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "popup.html"), // 默认入口
				background: path.resolve(__dirname, "./src/background.ts"), // 新增入口
			},
			output: {
				entryFileNames: "[name].js", // 输出文件名格式
				assetFileNames: "[name].[ext]",
			},
		},
	},
});

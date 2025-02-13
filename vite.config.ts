import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		// viteStaticCopy({
		// 	targets: [
		// 		{
		// 			src: "./src/background.ts", // 源文件路径（根目录）
		// 			dest: "dist", // 目标目录（默认输出到 dist 的根目录）
		// 		},
		// 	],
		// }),
	],
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

<script setup lang="ts"></script>

<template>
	<div>
		<h1>Proxy</h1>
		<div style="padding: 10px; width: 500px">
			<h3>代理配置 Proxy</h3>
			<div style="display: flex; width: 100%">
				<label>目标资源：</label>
				<input
					type="text"
					id="urlFilter"
					placeholder="请输入需要被代理的资源"
					style="flex: 1"
				/>
			</div>
			<div style="display: flex; width: 100%">
				<label>代理资源：</label>
				<input
					type="text"
					id="redirectUrl"
					placeholder="请输入要代理到的资源"
					style="flex: 1"
				/>
			</div>
			<button id="save" style="cursor: pointer">开启代理</button>
			<button id="close" style="cursor: pointer">关闭代理</button>
		</div>
	</div>
</template>
<script setup lang="ts">
document.addEventListener("DOMContentLoaded", async () => {
	console.log("popup.js loaded");
	const { urlFilter, redirectUrl } = await chrome.storage.local.get([
		"urlFilter",
		"redirectUrl",
	]);

	console.log(urlFilter, redirectUrl, "popup.js");
	// https://moa-bc.uban360.com/bpmn/form-client-web/index.js http://localhost:8098/index.js
	// https://moa-bc.uban360.com/form-data-manage/index.js https://localhost:8091/index.js
	document.getElementById("urlFilter").value =
		urlFilter || "https://moa-bc.uban360.com/form-data-manage/index.js";
	document.getElementById("redirectUrl").value =
		redirectUrl || "https://localhost:8091/index.js";

	document.getElementById("save").addEventListener("click", () => {
		chrome.storage.local.set({
			urlFilter: document.getElementById("urlFilter").value,
			redirectUrl: document.getElementById("redirectUrl").value,
		});
		window.close();
	});

	document.getElementById("close").addEventListener("click", () => {
		chrome.storage.local.remove(["urlFilter", "redirectUrl"]);
		window.close();
	});
});
</script>

<style scoped></style>

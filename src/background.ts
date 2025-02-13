// 初始化动态规则
chrome.runtime.onInstalled.addListener(async () => {
	console.log("installed");
	const rules = await createRedirectRule();
	if (rules) {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [],
			addRules: [rules],
		});
	}
});

// 创建重定向规则
async function createRedirectRule() {
	const { urlFilter, redirectUrl } = await chrome.storage.local.get([
		"urlFilter",
		"redirectUrl",
	]);

	// 如果代理功能未启用，则不添加规则
	if (!urlFilter || !redirectUrl) {
		return null;
	}

	// 确保 urlFilter 和 redirectUrl 都是一个有效的 URL，如果不是，则使用默认值
	const validRedirectUrl =
		redirectUrl && /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(redirectUrl)
			? redirectUrl
			: "https://localhost:8091/index.js";
	const validUrlFilter =
		urlFilter && /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(urlFilter)
			? urlFilter
			: "https://moa-bc.uban360.com/form-data-manage/index.js";

	console.log("urlFilter", urlFilter, "validRedirectUrl", validRedirectUrl);

	return {
		id: 1,
		priority: 1,
		action: {
			type: "redirect",
			redirect: {
				url: validRedirectUrl,
			},
		},
		condition: {
			urlFilter: validUrlFilter,
			resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"],
		},
	};
}

// 监听配置变更
chrome.storage.onChanged.addListener(async () => {
	console.log("storage changed");
	const rules = await createRedirectRule();
	if (rules) {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [1],
			addRules: [rules],
		});
	} else {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [1],
		});
	}
});

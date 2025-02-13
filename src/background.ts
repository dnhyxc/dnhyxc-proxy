// 创建重定向规则
async function createRedirectRule() {
	const { urlFilter, redirectUrl } = await chrome.storage.local.get([
		"urlFilter",
		"redirectUrl",
	]);

	// 如果代理功能未启用，则不添加规则
	if (!urlFilter?.length || !redirectUrl?.length) {
		return null;
	}

	const rules = urlFilter.map((i: string, index: number) => {
		// 确保 urlFilter 和 redirectUrl 都是一个有效的 URL，如果不是，则使用默认值
		const validUrlFilter =
			i && /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(i) ? i : "";
		const validRedirectUrl =
			redirectUrl[index] &&
			/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(redirectUrl[index])
				? redirectUrl[index]
				: "";

		return {
			id: index + 1,
			priority: 1,
			action: {
				type: "redirect",
				redirect: {
					url: validRedirectUrl,
				},
			},
			condition: {
				urlFilter: validUrlFilter,
				resourceTypes: ["main_frame", "script"],
			},
		};
	});

	return rules;
}

// 初始化动态规则
chrome.runtime.onInstalled.addListener(async () => {
	const rules = await createRedirectRule();
	if (rules?.length) {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [],
			addRules: rules,
		});
	}
});

// 监听配置变更
chrome.storage.onChanged.addListener(async () => {
	const rules = await createRedirectRule();
	if (rules) {
		console.log("rules-----", rules);
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds:
				rules?.map((i: any) => i.id) ||
				Array.from({ length: 101 }, (_, i) => i),
			addRules: rules,
		});
	} else {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds:
				rules?.map((i: any) => i.id) ||
				Array.from({ length: 101 }, (_, i) => i),
		});
	}
});

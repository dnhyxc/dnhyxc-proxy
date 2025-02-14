const getStorage = async (keys?: string[]) => {
	const { urlFilter, redirectUrl, rules, closedRules } =
		await chrome.storage.local.get(
			keys || ["urlFilter", "redirectUrl", "rules", "closedRules"]
		);

	return {
		urlFilter,
		redirectUrl,
		rules,
		closedRules,
	};
};

// 创建重定向规则
const createRedirectRule = async (
	urlFilter: string[],
	redirectUrl: string[]
) => {
	// 如果代理功能未启用，则不添加规则
	if (!urlFilter?.length || !redirectUrl?.length) {
		return null;
	}

	const rules = urlFilter.map((i: string, index: number) => {
		return {
			id: index + 1,
			priority: 1,
			action: {
				type: "redirect",
				redirect: {
					url: redirectUrl[index],
				},
			},
			condition: {
				urlFilter: i,
				resourceTypes: ["main_frame", "script"],
			},
		};
	});

	if (rules?.length) {
		chrome.storage.local.set({
			rules,
		});
	}

	return rules;
};

// 初始化动态规则
chrome.runtime.onInstalled.addListener(async () => {
	const { urlFilter, redirectUrl } = await getStorage();
	const rules = await createRedirectRule(urlFilter, redirectUrl);
	if (rules?.length) {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [],
			addRules: rules,
		});
	}
});

// 监听配置变更
chrome.storage.onChanged.addListener(
	async (changes: any, namespace: string) => {
		if (namespace === "local" && changes.urlFilter && changes.redirectUrl) {
			const { urlFilter, redirectUrl, closedRules } = await getStorage();
			const rules = await createRedirectRule(urlFilter, redirectUrl);
			const _rules = closedRules?.length
				? rules?.filter(
						(i: any) =>
							!closedRules.includes(
								i.condition.urlFilter + "-" + i.action.redirect.url
							)
				  )
				: rules;

			if (_rules) {
				await chrome.declarativeNetRequest.updateDynamicRules({
					removeRuleIds:
						rules?.map((i: any) => i.id) ||
						Array.from({ length: 100 }, (_, i) => i + 1),
					addRules: _rules,
				});
			} else {
				await chrome.declarativeNetRequest.updateDynamicRules({
					removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1),
				});
			}
		}
	}
);

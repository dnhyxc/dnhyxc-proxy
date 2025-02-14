export const getStorage = async (keys?: string[]) => {
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
export const createRedirectRule = async (
	urlFilter: string[],
	redirectUrl: string[]
) => {
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

	if (rules?.length) {
		chrome.storage.local.set({
			rules,
		});
	}

	return rules;
};

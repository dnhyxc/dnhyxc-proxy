<template>
	<div class="wrap">
		<div class="add">
			<div class="title">
				<img src="/public/128.png" alt="icon" class="icon" />
				Dnhyxc Proxy
			</div>
			<el-form
				ref="formRef"
				style="max-width: 600px"
				label-position="top"
				:model="dynamicValidateForm"
			>
				<el-form-item
					prop="urlFilter"
					label="目标资源"
					:rules="[
						{
							required: true,
							message: '请输入目标资源',
							trigger: 'blur',
						},
					]"
				>
					<el-input
						v-model="dynamicValidateForm.urlFilter"
						placeholder="请输入目标资源"
					/>
				</el-form-item>
				<el-form-item
					prop="redirectUrl"
					label="代理资源"
					:rules="[
						{
							required: true,
							message: '请输入代理资源',
							trigger: 'blur',
						},
					]"
				>
					<el-input
						v-model="dynamicValidateForm.redirectUrl"
						placeholder="请输入代理资源"
					/>
				</el-form-item>
			</el-form>
			<div class="btn-list">
				<div class="actions">
					<el-button
						type="primary"
						:disabled="
							!dynamicValidateForm.urlFilter || !dynamicValidateForm.redirectUrl
						"
						class="action"
						@click="onAddRule"
					>
						添加并开启代理
					</el-button>
					<el-button type="primary" class="action" @click="onOpenAll">
						开启全部代理
					</el-button>
				</div>
				<div class="actions">
					<el-button type="warning" class="action" @click="onCloseAll">
						关闭全部代理
					</el-button>
					<el-button type="danger" class="action" @click="onClear">
						清空全部规则
					</el-button>
				</div>
			</div>
		</div>
		<div v-if="filterUrls.length" class="rule-list">
			<div v-for="(i, index) in filterUrls" :key="i" class="rule-item">
				<div class="left">
					<div class="rule">
						<span class="labal">目标资源：</span>
						<span class="value">{{ i }}</span>
					</div>
					<div class="rule">
						<span class="label">代理资源：</span>
						<span class="value">{{ redirectUrls[index] }}</span>
					</div>
				</div>
				<div class="right">
					<el-button
						:type="
							closedKeys.includes(i + '-' + redirectUrls[index])
								? 'primary'
								: 'warning'
						"
						link
						class="edit"
						style="padding: 0"
						@click="() => onChangeRuleStatus(index)"
					>
						{{
							closedKeys.includes(i + "-" + redirectUrls[index])
								? "开启"
								: "关闭"
						}}
					</el-button>
					<el-button
						type="danger"
						link
						class="edit"
						style="padding: 0"
						@click="() => onDelete(index)"
					>
						删除
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { getStorage } from "@/utils";

const formRef = ref<FormInstance>();
const dynamicValidateForm = reactive<{
	urlFilter: string;
	redirectUrl: string;
}>({
	urlFilter: "",
	redirectUrl: "",
});
const filterUrls = ref<string[]>([]);
const redirectUrls = ref<string[]>([]);
const closedKeys = ref<string[]>([]);

onMounted(() => {
	nextTick(async () => {
		const { urlFilter, redirectUrl, closedRules } = await getStorage();
		filterUrls.value = urlFilter || [];
		redirectUrls.value = redirectUrl || [];
		dynamicValidateForm.redirectUrl = redirectUrl?.[0] || "";
		dynamicValidateForm.urlFilter = urlFilter?.[0] || "";
		closedKeys.value = closedRules || [];
	});
});

const onAddRule = async () => {
	const { urlFilter, redirectUrl } = await getStorage();
	formRef.value?.validate((valid) => {
		if (valid) {
			if (!urlFilter?.length || !redirectUrl?.length) {
				chrome.storage.local.set({
					urlFilter: [dynamicValidateForm.urlFilter],
					redirectUrl: [dynamicValidateForm.redirectUrl],
				});
				filterUrls.value = [dynamicValidateForm.urlFilter];
				redirectUrls.value = [dynamicValidateForm.redirectUrl];
			} else {
				const index1 = urlFilter?.findIndex(
					(i: string) => i === dynamicValidateForm.urlFilter
				);
				const index2 = redirectUrl?.findIndex(
					(i: string) => i === dynamicValidateForm.redirectUrl
				);
				if ((index1 === -1 && index2 === -1) || index1 !== index2) {
					chrome.storage.local.set({
						urlFilter: [dynamicValidateForm.urlFilter, ...urlFilter],
						redirectUrl: [dynamicValidateForm.redirectUrl, ...redirectUrl],
					});
					filterUrls.value = [dynamicValidateForm.urlFilter, ...urlFilter];
					redirectUrls.value = [
						dynamicValidateForm.redirectUrl,
						...redirectUrl,
					];
				}
			}
			ElMessage.success("设置成功");
			// window.close();
		} else {
			console.log("error submit");
		}
	});
};

const onOpenAll = async () => {
	const { rules } = await getStorage(["rules"]);
	chrome.storage.local.set({
		closedRules: [],
	});
	closedKeys.value = [];
	chrome.storage.local.set({
		closedRules: [],
	});
	updateRules(rules);
	ElMessage.success("代理已开启");
};

const onCloseAll = async () => {
	const { rules } = await getStorage();
	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds:
			rules?.map((i: any) => i.id) ||
			Array.from({ length: 100 }, (_, i) => i + 1),
	});
	closedKeys.value = rules.map(
		(i: any) => `${i.condition.urlFilter}-${i.action.redirect.url}`
	);
	chrome.storage.local.set({
		closedRules: [...closedKeys.value],
	});
	ElMessage.success("代理已关闭");
};

const onClear = () => {
	chrome.storage.local.remove([
		"urlFilter",
		"redirectUrl",
		"closedRules",
		"rules",
	]);
	filterUrls.value = [];
	redirectUrls.value = [];
	closedKeys.value = [];
	ElMessage.success("规则已清空");
};

const updateRules = async (rules: any[]) => {
	const _rules = rules?.filter(
		(i: any) =>
			!closedKeys.value.includes(
				i.condition.urlFilter + "-" + i.action.redirect.url
			)
	);
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
};

const onChangeRuleStatus = async (index: number) => {
	const { closedRules, rules } = await getStorage(["closedRules", "rules"]);
	let _closedKeys: string[] = [];

	if (
		closedKeys.value.includes(
			filterUrls.value[index] + "-" + redirectUrls.value[index]
		)
	) {
		_closedKeys = closedRules.filter(
			(i: string) =>
				i !== `${filterUrls.value[index]}-${redirectUrls.value[index]}`
		);
		chrome.storage.local.set({
			closedRules: _closedKeys,
		});
		closedKeys.value = _closedKeys;
	} else {
		_closedKeys = [...(closedRules || [])];
		const key = `${filterUrls.value[index]}-${redirectUrls.value[index]}`;
		_closedKeys.push(key);
		chrome.storage.local.set({
			closedRules: _closedKeys,
		});
		closedKeys.value = _closedKeys;
	}
	updateRules(rules);
};

const onDelete = (index: number) => {
	filterUrls.value.splice(index, 1);
	redirectUrls.value.splice(index, 1);
	chrome.storage.local.set({
		urlFilter: [...filterUrls.value],
		redirectUrl: [...redirectUrls.value],
	});
};
</script>

<style scoped lang="less">
.wrap {
	display: flex;
	flex-direction: column;
	width: 500px;
	padding: 10px;
	box-sizing: border-box;
	overflow: hidden;

	.add {
		.title {
			display: flex;
			align-items: center;
			font-size: 20px;
			font-weight: 500;
			padding: 0 0 10px;
			margin-bottom: 10px;
			border-bottom: 1px solid #5e5e5e;

			.icon {
				width: 35px;
				height: 35px;
				margin-right: 10px;
			}
		}
	}

	.btn-list {
		margin-top: 24px;

		.actions {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			margin-top: 10px;

			.action {
				flex: 1;
			}
		}
	}

	.rule-list {
		width: 100%;
		max-height: 278px;
		margin-top: 16px;
		border-radius: 5px;
		padding: 1px 5px;
		box-sizing: border-box;
		background-color: #3e3e3e;
		overflow: auto;

		.rule-item {
			display: flex;
			align-items: center;
			border-bottom: 1px solid #5e5e5e;
			cursor: pointer;

			.left {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			&:last-child {
				border-bottom: none;
			}

			.rule {
				display: flex;
				justify-content: flex-start;
				padding: 3px 0;
				font-size: 14px;

				.value {
					flex: 1;
					text-align: left;
				}
			}
		}
	}

	:deep {
		.el-form-item__label {
			width: 100%;
			color: #fff;
		}
	}
}
</style>

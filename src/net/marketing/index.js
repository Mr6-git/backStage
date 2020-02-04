import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_MARKETING_API;

export default {
	/* ============= 红包管理 =============  */
	// 获取红包列表
	getRedEnvelop: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/red_envelops`, data);
	},
	// 获取单个红包信息
	getRedEnvelopInfo: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}`);
	},
	// 新增红包
	createRedEnvelop: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/red_envelop`, data);
	},
	// 更新红包
	updateRedEnvelop: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}`, data);
	},
	// 更新红包类型
	updateRedEnvelopAssort: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}/update_assort`, data);
	},
	// 禁用/启用红包
	enabledRedEnvelop: (_id, param = 'enabled') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}/${param}`);
	},
	// 追加红包
	appendRedEnvelop: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}/append`, data);
	},
	// 领取红包
	receiveRedEnvelop: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/red_envelop/receive`, data);
	},
	// 获取领取列表
	getRedEnvelopList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/red_envelop_logs`, data);
	},
	// 回收红包
	recoveryRedEnvelop: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}/recovery`);
	},
	// 获取单个红包领取记录
	getReceiveLogs: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}/receive_logs`, data);
	},
	// 获取单个红包每日领取统计
	getDailyStatistics: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/red_envelop/${_id}/daily_statistics`, data);
	},

	/* ============= 微信客服管理 =============  */
	// 获取微信客服列表
	getWechats: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/wechats`, data);
	},
	// 新建微信客服
	createWechat: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/wechat`, data);
	},
	// 修改微信客服
	updateWechat: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/wechat/update/${_id}`, data);
	},
	// 删除微信客服
	deleteWechat: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/wechat/${_id}`);
	},
	// 禁用/启用微信客服
	enabledWechat: (_id, param = 'enabled') => {
		const data = {
			"ids": _id.toString()
		};
		return net.PUT(`${API}/teams/${TeamData.currentId}/wechat/${param}`, data);
	},
	// 批量禁用/启用微信客服
	enabledWechatBatch: (data, param = 'enabled') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/wechat/${param}`, data);
	},

	/* ============= 推广渠道 =============  */
	// 获取推广渠道
	getChannels: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/channels`, data);
	},
	// 获取单个推广渠道信息
	getSingleChannel: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/channel/${_id}`);
	},
	// 创建渠道
	createChannels: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/channel`, data);
	},
	// 修改渠道
	updateChannels: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/channel/${_id}/update`, data);
	},
	// 删除渠道
	deleteChannels: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/channel/${_id}/delete`);
	},
	// 禁用/启用渠道
	enabledChannels: (_id, param = 'enabled') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/channel/${_id}/${param}`);
	},

	/* ============= 短信验证码 =============  */
	// 获取短信验证码
	getSmsCode: (mobile) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/sms_code?mobile=${mobile}`);
	},

	/* =============  门票申请管理 =============  */
	// 获取门票申请列表
	getTicketsApplyList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/tickets`, data);
	},
	// 获取门票申请库存数
	getTicketCount: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/ticket/total`);
	},
	// 修改门票申请数
	editTicketCount: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/ticket/stock`, data);
	},
	// 批量审核通过
	auditPass: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/ticket/pass`, data);
	},
	// 批量审核拒绝
	auditRefuse: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/ticket/refuse`, data);
	},
	// 导出门票申请列表
	exportTicketsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/tickets/export`, data);
	},

	/* ============= 激活码管理 =============  */
	// 获取激活码列表
	getInviteCodeList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/invite_code`, data);
	},
	// 新增激活码
	addInviteCode: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/invite_code`, data);
	},
	// 获取激活码单个详情
	getSingleCode: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/invite_code/info/${id}`);
	},
	// 启用，禁用
	tagInviteCode: (id, params) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/invite_code/${params}/${id}`);
	},
	// 获取激活码详情列表
	getInviteCodeDetail: (id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/invite_code/details/${id}`, data);
	},
	// 激活码作废
	cancelInviteCode: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/invite_code/to_void`, data);
	},
	// 导出激活码
	exportInviteCode: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/invite_code/export/${id}`);
	},
}
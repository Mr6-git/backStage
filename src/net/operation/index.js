import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_API;

export default {
	/* =============  客户管理 =============  */
	// 获取客户列表
	getCustomers: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers`, obj);
	},
	// 导出客户列表
	exportCustomer: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/export`, obj);
	},
	// 获取单条客户信息
	getSingleCustomer: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}`);
	},
	// 批量转移客户
	transferCustomer: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/batch_transfer`, data);
	},
	// 批量冻结客户
	freezeCustomer: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/batch_freeze`, data);
	},
	// 批量解冻客户
	unfreezeCustomer: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/batch_unfreeze`, data);
	},
	getCustomerFund: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/funds`);
	},
	// 获取客户虚拟币流水
	getCustomerVirtualDetails: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/virtual_details`, data);
	},
	// 获取客户积分流水
	getCustomerBountyDetails: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/bounty_details`, data);
	},
	// 获取客户虚拟币流水
	getCustomerCapitalDetails: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/capital_details`, data);
	},
	// 获取客户投注订单
	getTradeDetails: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/trade_details`, data);
	},
	// 获取单个客户银行卡列表
	getCustomerCard: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/bankcard`);
	},
	// 获取IP统计信息
	getCustomerIPTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/ip_total`, data);
	},

	// 编辑客户密码
	resetPwd: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customer/${_id}/password`, data);
	},
	// 批量编辑客户来源
	editSource: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/batch_source`, data);
	},
	// 编辑客户出入金状态
	editInout: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customer/${_id}/funds_status`, data);
	},
	// 设置为测试客户
	setInternalStaff: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customer/${_id}/internal_staff`);
	},
	// 取消设置测试客户
	cancelInternalStaff: (_id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customer/${_id}/internal_staff/cancel`);
	},
	// 获取客户访问日志
	getCustomerLogging: (_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${_id}/logging`, data);
	},

	// 获取快捷筛选列表
	getQuickFilter: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/quick_filter`);
	},
	// 添加新快捷筛选
	addQuickFilter: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/customers/quick_filter`, data);
	},
	// 编辑快捷筛选
	editQuickFilter: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/quick_filter/${_id}`, data);
	},
	// 删除快捷筛选
	deleteQuickFilter: (_id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/customers/quick_filter/${_id}`);
	},

	// 获取已有标签
	getTags: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/tags`);
	},
	// 编辑客户标签
	editCustomerTags: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customer/${_id}/tags`, data);
	},

	/* =============  资金管理（客户） =============  */
	// 获取虚拟币流水
	getVirtualDetails: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/virtual_details`, data);
	},
	// 获取虚拟币流水统计
	getVirtualTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/virtual_total`, data);
	},
	// 导出资金流水
	exportVirtual: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/virtual_details/export`, data);
	},
	// 获取积分流水
	getBountyDetails: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/bounty_details`, data);
	},
	// 获取积分流水统计
	getBountyTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/bounty_total`, data);
	},
	// 导出积分流水
	exportBounty: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/bounty_details/export`, data);
	},
	// 获取资金流水
	getCapitalDetails: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/capital_details`, data);
	},
	// 获取资金流水统计
	getCapitalTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/capital_total`, data);
	},
	// 导出资金流水
	exportCapital: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/capital_details/export`, data);
	},
	// 获取充值流水
	getRechargeDetails: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/recharge_details`, data);
	},
	// 导出充值流水
	exportRecharge: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/recharge_details/export`, data);
	},
	// 获取客户资金排行榜
	getFortuneList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/fortune_list`, data);
	},
	// 资金冲正（虚拟币流水）
	reverseManage: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/funds/reverse_manage`, data);
	},
	// 资金冲正（积分流水）
	reverseBountyManage: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/funds/bounty_details/reverse_manage`, data);
	},

	/* =============  资金管理（服务商） =============  */
	// 获取资金流水
	getFundFlow: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/fund_details`, { limit: 10, ...data });
	},
	// 获取资金流水统计
	getFundTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/fund_total`, data);
	},
	// 获取所有提现信息 （充值提现管理 - 服务商/分销商）
	getCashingService: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/agency_orders`, { limit: 10, ...data });
	},
	// 获得服务商账户余额
	getTotalService: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/agency/${TeamData.currentId}/balance`);
	},
	// 获取所有提现信息 （充值提现管理 - 运营商）
	getCashingOperator: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/service_orders`, { limit: 10, ...data });
	},
	// 获取单条提现信息
	getSingle: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/capital/cashing_manage/single/${_id}`);
	},
	// 获取附件信息
	getAttachments: (_id) => {
		return `${API}/teams/${TeamData.currentId}/attachments/${_id}`;
	},
	// 申请提交（充值提现）
	submitApplying: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/fund/fund_order`, data);
	},
	// 申请取消（充值提现）
	submitCancel: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/fund/fund_order/${id}/cancel`);
	},
	// 审核通过（充值提现）
	passCashing: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/fund/fund_order/${id}/pass`, data);
	},
	// 审核拒绝（充值提现）
	refuseCashing: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/fund/fund_order/${id}/refuse`, data);
	},

	// 确认提现
	cashingConfirm: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/capital/cashing_manage/${_id}/confirm`, data);
	},
	// 拒绝提现
	cashingRefuse: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/capital/cashing_manage/${_id}/refuse`, data);
	},
	// 完成提现
	cashingComplete: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/capital/cashing_manage/${_id}/complete`, data);
	},

	/* =============  合规管理 =============  */
	// 获取客户列表
	complianceCustomer: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers`, { limit: 10, ...data });
	},
	// 客户列表 - 导出
	exportComplianceCustomer: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers/export`, data);
	},
	// 批量转移客户（指定ID）
	transferComplianceCustomer: (data, isAll) => {
		if (isAll) {
			return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customers/batch_filter_transfer`, data);
		} else {
			return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customers/batch_transfer`, data);
		}
	},

	// 获取客户实名认证列表
	customerVerified: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers/idauth`, { limit: 10, ...data });
	},
	// 获取客户实名认证 - 单条信息
	getVerifiedInfo: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customer/idauth/${id}`);
	},
	// 实名认证 - 修改信息
	editCustomer: (_id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/compliance/customer/idauth/${_id}`, data);
	},
	// 实名认证 - 审核 通过
	passCustomer: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/idauth/${_id}/pass`, data);
	},
	// 实名认证 - 审核 拒绝
	refuseCustomer: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/idauth/${_id}/refuse`, data);
	},

	// 注册审核列表
	regAudit: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers/register`, data);
	},
	// 注册审核 - 修改信息
	changeReg: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/register/${id}`, data);
	},
	// 注册审核 - 通过
	passReg: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/register/${id}/pass`);
	},
	// 注册审核 - 拒绝
	refuseReg: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/register/${id}/refuse`);
	},
	// 注册审核 - 批量通过
	passRegBatch: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/customers/register/batch_pass`, data);
	},
	// 注册审核 - 批量拒绝
	refuseRegBatch: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/customers/register/batch_refuse`, data);
	},

	// 昵称审核列表
	nameAudit: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers/nickname`, data);
	},
	// 昵称审核 - 单个信息
	nameAuditSingle: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers/nickname/${id}`);
	},
	// 昵称审核 - 修改信息
	changeName: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/nickname/${id}`, data);
	},
	// 昵称审核 - 通过
	passName: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/nickname/${id}/pass`);
	},
	// 昵称审核 - 拒绝
	refuseName: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/nickname/${id}/refuse`);
	},
	// 昵称审核 - 批量通过
	passNameBatch: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/customers/nickname/batch_pass`, data);
	},
	// 昵称审核 - 批量拒绝
	refuseNameBatch: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/customers/nickname/batch_refuse`, data);
	},

	// 头像审核列表
	avatarAudit: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customers/avatar`, data);
	},
	// 头像审核 - 修改信息
	changeAvatar: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/compliance/customer/avatar/${id}`, data);
	},
	// 头像审核 - 通过
	passAvatar: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/avatar/${id}/pass`);
	},
	// 头像审核 - 拒绝
	refuseAvatar: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/avatar/${id}/refuse`);
	},
	// 头像审核 - 批量通过
	passAvatarBatch: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/customers/avatar/batch_pass`, data);
	},
	// 头像审核 - 批量拒绝
	refuseAvatarBatch: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/customers/avatar/batch_refuse`, data);
	},

	/* =============  客户风控 =============  */
	// 获取客户风控列表
	getCustomerRisk: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/risks`, { limit: 10, ...data });
	},
	// 创建客户风控
	createCustomerRisk: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/customers/risk`, data);
	},
	// 编辑客户风控
	editCustomerRisk: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/risk/${id}`, data);
	},
	// 获取全局客户风控
	getCustomerGlobal: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customers/risk/global`);
	},
	// 编辑全局客户风控
	editCustomerGlobal: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/customers/risks/global`, data);
	},
	// 获取单个客户风控
	getSingleCustomerRisk: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/customer/${id}/risk`);
	},

	/* =============  客户反馈 =============  */
	// 客户反馈列表
	getFeedbacksList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customer/feedbacks`, data);
	},
	// 获取单个反馈信息
	getFeedback: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customer/feedback/${id}`);
	},
	// 批量处理反馈
	dealFeedbacks: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/feedback/batch_handle`, data);
	},
	// 备注反馈
	remarkFeedbacks: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/customer/feedback/${id}`, data);
	},
	// 获取反馈结果列表
	getBandlesList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/customer/feedbacks/handles`, data);
	},

	/* =============  下载日志 =============  */
	// 获取下载记录
	getDownloadList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/exports`, data);
	},
	// 下载Excel文件
	downloadExcelFile: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/export/${_id}`);
	},
}

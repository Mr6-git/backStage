import net from '@/net';
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_API;

export default {
	/* =============  财务管理 =============  */
	// 获取收支明细
	getGeneralDetails: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/financial/general_details`, data);
	},
	// 导出收支明细
	getGeneralExport: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/financial/general_details/export`);
	},
	// 获取提现信息
	getCashingDetails: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/financial/cashing_details`, data);
	},

	/* =============  站内信 =============  */
	// 获取站内消息
	getStationNews: (obj = { assort: -1, is_read: -1, limit: 10, page: 1 }) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/messages`, obj);
	},
	// 获取未读消息统计
	getUnRead: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/messages/statistics`);
	},
	// 标记消息已读
	batchReadNews: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/messages/batch_read`, data);
	},
	// 删除消息
	deleteNews: (data) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/messages`, data);
	},

	/* =============  接收管理 =============  */
	// 获取列表
	getMsgSetting: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/message_settings`);
	},
	// 设置接收人
	setReciever: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/message_settings/${_id}`, data);
	},
	// 批量添加接收人
	addReciever: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/message_settings`, data);
	},
	// 批量移除接收人
	deleteReciever: (data) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/message_settings`, data);
	},

	/* =============  事件日志 =============  */
	// 获取操作日志（按时间）
	getLogByTime: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/user/logger/get_by_time`, data);
	},
	// 获取操作日志（按聚合）
	getLogByMashup: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/user/logger/get_by_mashup`, data);
	},
	// 获取操作日志（按业务）
	getLogByEntity: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/user/logger/get_by_entity`, data);
	},
	// 获取访问日志
	getUserLog: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/user/logging`, data);
	},

	/* =============  个人中心 =============  */
	// 获取用户访问日志
	getVisitLog: (data) => {
		return net.GET(`${API}/user/logging`, data);
	},
	// 获取安全日志
	getSecurityLog: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/security_logs`, data);
	},
	// 修改用户信息
	putPersonal: (data) => {
		return net.PUT(`${API}/user/personal`, data);
	},
	// 修改用户手机
	putMobile: (data) => {
		return net.PUT(`${API}/user/mobile`, data);
	},
	// 修改用户密码
	putPassword: (data) => {
		return net.PUT(`${API}/user/password`, data);
	},
	// 修改用户邮箱
	putEmail: (data) => {
		return net.PUT(`${API}/user/mail`, data);
	},
	// 检查用户手机号码
	mobileCheck: (data) => {
		return net.GET(`${API}/user/mobile/check`, data);
	},
	// 发送手机验证码
	smsSend: (data) => {
		return net.POST(`${API}/user/security/sms/send`, data);
	},
	// 重发手机验证码
	smsResend: (data) => {
		return net.POST(`${API}/user/security/sms/resend`, data);
	},
	// 核对手机验证码
	smsCheck: (data) => {
		return net.POST(`${API}/user/security/sms/check`, data);
	},
	// 核对用户身份（手机号）
	verifyedSMS: (data) => {
		return net.POST(`${API}/user/security/sms/verifyed`, data);
	},
	// 发送邮件验证码
	emailSend: (data) => {
		return net.POST(`${API}/user/security/mail/send`, data);
	},
	// 重发邮件验证码
	emailResend: (data) => {
		return net.POST(`${API}/user/security/mail/resend`, data);
	},
	// 核对邮件验证码
	emailCheck: (data) => {
		return net.POST(`${API}/user/security/mail/check`, data);
	},
	// 验证用户身份（邮箱）
	verifyedEmail: (data) => {
		return net.POST(`${API}/user/security/mail/verifyed`, data);
	},

	/* =============  访问限制 =============  */
	//获取IP排行列表
	getIpRankLists: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/ip/rank`, data);
	},
	// 获取IP黑名单列表
	getIpBlackLists: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/compliance/ip_blacklists`, data);
	},
	// 创建IP黑名单
	createIpBlack: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/compliance/ip_blacklist`, data);
	},
	// 编辑IP黑名单
	editIpBlack: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/compliance/ip_blacklist/${id}`, data);
	},
	// 删除IP黑名单
	delIpBlack: (data) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/compliance/ip_blacklist`,data);
	},
}

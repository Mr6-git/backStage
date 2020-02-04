import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_API;

export default {
	/* ============= 其他 ============= */
	// 获取上传地址
	getUploadUrl: () => {
		return `${API}/teams/${TeamData.currentId}/attachments/upload`;
	},
	// 获取文件
	uploadFile: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/attachments/upload`, data);
	},

	/* ============= 部门 ============= */
	// 获取部门信息
	getDepartments: (agencyId) => {
		if (!agencyId) {
			agencyId = TeamData.currentId;
		}
		return net.GET(`${API}/teams/${agencyId}/departments`);
	},
	// 新建部门
	createDepartment: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/department`, data);
	},
	// 修改部门
	putDepartment: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/department/${id}`, data);
	},
	// 删除部门
	deletetDepartment: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/department/${id}`);
	},
	// 上移部门
	moveUpDepartment: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/departments/move_up/${id}`);
	},
	// 下移部门
	moveDownDepartment: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/departments/move_down/${id}`);
	},

	// 获取模块文件列表
	getApps: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/apps/being`, data);
	},

	/* ============= 角色 ============= */
	// 获取角色列表
	getRoles: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/roles`);
	},
	// 获取角色权限
	getRolePermissions(id, data) {
		return net.GET(`${API}/teams/${TeamData.currentId}/role/${id}/permissions`, data);
	},
	// 修改角色权限
	putRolePermissions(id, data) {
		return net.PUT(`${API}/teams/${TeamData.currentId}/role/${id}/permissions`, data);
	},
	// 创建角色
	createRole: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/role`, data);
	},
	// 修改角色
	putRole: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/role/${id}`, data);
	},
	// 删除角色
	deleteRole: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/role/${id}`);
	},
	// 修改角色下的成员
	putRoleMember: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/role/${id}/members`, data);
	},

	/* ============= 成员 ============= */
	// 获取成员列表
	getMembers: (agencyId) => {
		if (!agencyId) {
			agencyId = TeamData.currentId;
		}
		return net.GET(`${API}/teams/${agencyId}/members`);
	},
	// 获取单个成员权限
	getMemberPermissions(id, data) {
		return net.GET(`${API}/teams/${TeamData.currentId}/member/${id}/permissions`, data);
	},
	// 修改单个成员权限
	putMemberPermissions(id, data) {
		return net.PUT(`${API}/teams/${TeamData.currentId}/member/${id}/permissions`, data);
	},
	// 获取单个成员
	getSingleMember(id) {
		return net.GET(`${API}/teams/${TeamData.currentId}/member/${id}`);
	},
	// 新建成员
	createMember(data) {
		return net.POST(`${API}/teams/${TeamData.currentId}/member`, data);
	},
	// 修改成员
	modifyMember: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/member/${id}`, data);
	},
	// 启用成员
	enabledMember: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/members/batch_enabled`, data);
	},
	// 禁用成员
	disabledMember: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/members/batch_disabled`, data);
	},
	// 删除成员
	deleteMember: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/members/batch_delete`, data);
	},
	// 修改成员密码
	editMemberPwd: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/member/${id}/update_password`, data);
	},

	/* ============= 服务商 ============= */
	// 获取服务商列表
	getAgency: (id) => {
		let param = '';
		if (!isNaN(id)) {
			param = `?id=${id}`;
		}
		return net.GET(`${API}/teams/${TeamData.currentId}/agencys${param}`);
	},
	// 获取单个服务商信息
	getSingleAgency: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/agency/${id}`);
	},
	// 创建服务商
	createAgency: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/agency`, data);
	},
	// 修改服务商
	modifyAgency: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/agency/${id}`, data);
	},
	// 启用服务商
	enabledAgency: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/agencys/batch/enabled`, data);
	},
	// 禁用服务商
	disabledAgency: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/agencys/batch/disabled`, data);
	},

	/* =============个人权限 ============= */
	getUserPermissions: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/user/permissions`);
	},

	/* =============字段编辑器 ============= */

	// 获取指定栏目的所有字段
	getFieldEditor: (assort) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/field_editor/${assort}`);
	},
	// 修改字段信息
	putFieldEditor: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/field_editor/${id}`, data);
	},
	// 启用/禁用
	enabledOrNot: (id, param = 'enable') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/field_editor/${id}/${param}`);
	},

	/* =============应用管理 ============= */
	// 获取应用列表
	getAppList: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/apps`, obj);
	},
	// 创建应用
	createApp: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/app`, data);
	},
	// 编辑应用
	editApp: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/app/${id}`, data);
	},
	// 复制应用
	copyApp: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/app/copy/${id}`);
	},
	// 删除应用
	deleteApp: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/app/${id}`);
	},

	/* =============导航配置 ============= */
	// 获取导航列表
	getNavs: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/navigations`, data);
	},
	// 创建导航
	createNav: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/navigation`, data);
	},
	// 编辑导航
	editNav: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/navigation/${id}`, data);
	},
	// 删除导航
	deleteNav: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/navigation/${id}`);
	},
	// 禁用导航
	disabledNav: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/navigations/${id}/disabled`);
	},
	// 启用导航
	enabledNav: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/navigations/${id}/enabled`);
	},

	/* =============导航分类 ============= */
	// 获取分类列表
	getCategory: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/navigation_categorys`, data);
	},
	// 创建分类
	createCategory: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/navigation_category`, data);
	},
	// 编辑分类
	editCategory: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/navigation_category/${id}`, data);
	},
	// 删除分类
	deleteCategory: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/navigation_category/${id}`);
	},

	/* =============广告（位置）管理 ============= */
	// 获取广告位置列表
	getAdvPosition: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/commend_positions`, data);
	},
	// 获取单个广告位置
	getSinglePosition: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/commend_position/${id}`);
	},
	// 创建广告位置
	createPosition: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/commend_position`, data);
	},
	// 编辑广告位置
	editPosition: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/commend_position/${id}`, data);
	},
	// 删除广告位置
	deletePosition: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/commend_position/${id}`);
	},
	// 禁用广告位置
	disabledPosition: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/commend_positions/${id}/disabled`);
	},
	// 启用广告位置
	enabledPosition: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/commend_positions/${id}/enabled`);
	},

	/* =============广告管理 ============= */
	// 获取广告列表
	getAdv: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/commends`, data);
	},
	// 获取单个广告
	getSingleAdv: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/commend/${id}`);
	},
	// 创建广告
	createAdv: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/commend`, data);
	},
	// 编辑广告
	editAdv: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/commend/${id}`, data);
	},
	// 删除广告
	deleteAdv: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/commend/${id}`);
	},
	// 禁用广告
	disabledAdv: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/commend/${id}/disabled`);
	},
	// 启用广告
	enabledAdv: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/commend/${id}/enabled`);
	},

	/* =============参数列表（应用） ============= */
	// 获取参数列表
	getArg: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/params`, data);
	},
	// 创建参数
	createArg: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/param`, data);
	},
	// 编辑参数
	editArg: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/param/${id}`, data);
	},
	// 删除参数
	deleteArg: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/param/${id}`);
	},

	/* =============会员等级 ============= */
	// 获取会员等级列表
	getLevel: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/member_levels`);
	},
	// 创建会员等级
	createLevel: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/member_level`, data);
	},
	// 编辑会员等级
	editLevel: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/member_level/${id}`, data);
	},
	// 删除会员等级
	deleteLevel: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/member_level/${id}`);
	},

	/* =============参数配置 ============= */
	// 获取参数配置列表
	getParam: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/global_params`, data);
	},
	// 创建参数配置
	createParam: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/global_param`, data);
	},
	// 编辑参数配置
	editParam: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/global_param/${id}`, data);
	},
	// 删除参数配置
	deleteParam: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/global_param/${id}`);
	},

	/* =============支付通道 ============= */
	// 获取支付通道列表
	getChannel: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/channels`, data);
	},
	// 创建支付通道
	createChannel: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/channel`, data);
	},
	// 编辑支付通道
	editChannel: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/channel/${id}`, data);
	},
	// 删除支付通道
	deleteChannel: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/channel/${id}/delete`);
	},
	// 禁用支付通道
	disabledChannel: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/channel/${id}/disabled`);
	},
	// 启用支付通道
	enabledChannel: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/channel/${id}/enabled`);
	},

	/* =============银行管理 ============= */
	// 获取银行列表
	getBank: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/banks`, data);
	},
	// 创建银行
	createBank: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/bank`, data);
	},
	// 编辑银行
	editBank: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/bank/${id}`, data);
	},
	// 删除银行
	deleteBank: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/bank/${id}`);
	},
	// 禁用银行
	disabledBank: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/banks/batch_disabled`, data);
	},
	// 启用银行
	enabledBank: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/banks/batch_enabled`, data);
	},

	/* =============充值管理 ============= */
	// 获取充值管理列表
	getRecharge: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/recharges`, data);
	},
	// 创建充值管理
	createRecharge: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/recharge`, data);
	},
	// 编辑充值管理
	editRecharge: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/settings/recharge/${id}`, data);
	},
	// 删除充值管理
	deleteRecharge: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/recharge/${id}/delete`);
	},
	// 禁用充值管理
	disabledRecharge: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/recharge/${id}/disabled`);
	},
	// 启用充值管理
	enabledRecharge: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/recharge/${id}/enabled`);
	},

	/* =============公告管理 ============= */
	// 获取公告列表
	getAnnounce: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/announcements`, data);
	},
	// 创建公告
	createAnnounce: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/announcement`, data);
	},
	// 编辑公告
	editAnnounce: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/announcement/${id}`, data);
	},
	// 删除公告
	deleteAnnounce: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/announcement/${id}`);
	},

	/* =============支付通道列表（应用） ============= */
	// 获取支付通道列表
	getPayChannel: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/pay_channels`, data);
	},
	// 选择支付通道列表
	getPayChannelChoice: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/pay_channel/choice`, data);
	},
	// 创建参数
	createPayChannel: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/pay_channel`, data);
	},
	// 编辑参数
	editPayChannel: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/pay_channel/${id}`, data);
	},
	// 删除参数
	deletePayChannel: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/settings/pay_channel/${id}`);
	},
	// 禁用支付通道
	disabledPayChannel: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/pay_channel/${id}/disabled`);
	},
	// 启用支付通道
	enabledPayChannel: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/pay_channel/${id}/enabled`);
	},

	/* =============APP发布日志管理 ============= */
	//列表
	appsReleaseLogs: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settings/apps_release_logs`, data);
	},
	//新增
	addAppLog: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/settings/apps_release_logs`, data);
	},
	//禁用
	disabledAppLog: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/apps_release_logs/${id}/disabled`);
	},
	//启用
	enabledAppsLog: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/settings/apps_release_logs/${id}/enabled`);
	},

	/* =============钉钉绑定 ============= */
	dingTalk: (data) => {
		return net.POST(`${API}/callback/dingtalk/login?type=scan`, data);
	},
	// 解绑钉钉
	unBindDingding: () => {
		return net.PUT(`${API}/user/dingtalk/unbundle`);
	},
	// 重置密码
	resetPwd: (team_id, data) => {
		return net.PUT(`${API}/user/password/reset`, data);
	},

	/* =============钉钉机器人管理 ============= */
	//查询消息类型及所有机器人
	getAllRobot: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dingtalk_robot/msg_type`);
	},
	// 查询钉钉机器人
	getDingRobot: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dingtalk_robot`, data);
	},
	// 创建钉钉机器人
	createDingRobot: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/dingtalk_robot`, data);
	},
	// 修改钉钉机器人
	editDingRobot: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/dingtalk_robot/${id}`, data);
	},
	// 删除钉钉机器人
	delDingRobot: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/dingtalk_robot/${id}`);
	},
	/* =============钉钉消息模板 ============= */
	// 查询钉钉机器人
	getDingtalkTemplate: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dingtalk_template`, data);
	}
}
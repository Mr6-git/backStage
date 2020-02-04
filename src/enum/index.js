export const AUTH = {
	// 客户
	ALLOW_CUSTOMERS: 'fdb153c8fcf411e89ac1000c29f135eb', // 客户管理
	ALLOW_TRANSFER_CUSTOMER: '0843ed99fcf511e89ac1000c29f135eb', // 允许转移客户
	ALLOW_FREEZE_CUSTOMER: '0d277531fcf511e89ac1000c29f135eb', // 允许冻结解冻客户
	ALLOW_CUSTOMER_PASSWORD: '4ba837589fcf11e9879f00163e065e43', // 允许修改客户密码
	ALLOW_CUSTOMER_SOURCE: '50392cd49fcf11e9879f00163e065e43', // 允许修改客户来源
	ALLOW_CUSTOMER_CAPITAL: '56103fed9fcf11e9879f00163e065e43', // 允许修改资金限制
	ALLOW_EXPORT_CUSTOMER: '0259a9b8fcf511e89ac1000c29f135eb', // 允许导出客户数据
	ALLOW_INTERNAL_STAFF: '5bfbf2ddb1ec11e9879f00163e065e43', // 允许将客户设置为测试客户
	ALLOW_CUSTOMER_MOBILE: '844d37e0ca0b11e99ab500163e065e43', // 允许查看客户手机号
	ALLOW_CUSTOMER_RISK: 'a4d2132b878411e9879f00163e065e43', // 客户风控
	ALLOW_CUSTOMER_TAGS: '431265a3209311ea9ab500163e065e43', // 客户标签

	// 合规
	ALLOW_OPERATE_CUSTOMER_TRANSFER: 'f317e9611df911e9ac32000c29f135eb', // 允许合规转移客户
	ALLOW_OPERATE_CUSTOMER_FROZEN: 'fdba3cb21df911e9ac32000c29f135eb', // 允许合规冻结解冻客户

	// 赛事
	ALLOW_MARKETS: 'cd4ee05a91b111e9879f00163e065e43', // 赛事管理
	ALLOW_MARKET_PUBLISH: '158a3a78bb0c11e99ab500163e065e43', // 允许推送/关闭比赛
	ALLOW_MARKET_RESULT: 'd54bd0bebb0d11e99ab500163e065e43', // 编辑赛果
	ALLOW_MARKET_EDIT: 'efe26485bb0d11e99ab500163e065e43', // 编辑赛事信息
	ALLOW_MARKET_SETTLE: '183676a7bb0e11e99ab500163e065e43', // 编辑彩果
	ALLOW_MARKET_SETTLE_WAIT_CHECK: '2480b2ebbb0e11e99ab500163e065e43', // 设为人工审核彩果
	ALLOW_MARKET_SP_ENABLED: '2ec5c4b6bb0e11e99ab500163e065e43', // 玩法开盘/封盘
	ALLOW_MARKET_EXPORT_ORDER: 'c1b519d3bfd311e9bb2398039b158ede', // 允许导出竞猜订单
	ALLOW_MARKET_RISK: '9d8b3a25878411e9879f00163e065e43', // 赛事风控

	ALLOW_MARKET_ODDS_ADJUST: 'ee4bb8670cc611ea9ab500163e065e43', // 允许赔率调水
	ALLOW_MARKET_SP_DISPLAY: '0c0199840cc911ea9ab500163e065e43', // 允许显示/隐藏玩法
	ALLOW_MARKET_SP_EDIT: '47b444dc0cc911ea9ab500163e065e43', // 允许开盘/封盘玩法
	ALLOW_MARKET_EVENT_EDIT: 'e5e82dcf0f2611ea9ab500163e065e43', // 允许发布/关闭比赛
	ALLOW_MARKET_BET_EDIT: 'febbf3eb0f2611ea9ab500163e065e43', // 允许开启/关闭竞猜
	ALLOW_MARKET_HOT_FLAG: '0d4cf9cd0f2711ea9ab500163e065e43', // 允许标记/取消热门赛事
	ALLOW_MARKET_EXCEPTION_FLAG: '228d03b60f2711ea9ab500163e065e43', // 允许设为异常赛事
	ALLOW_MARKET_MANUAL_REWARD: '34ba185c0f2711ea9ab500163e065e43', // 允许设为人工派奖
	ALLOW_MARKET_VIRTUAL_NUM: '45f107130f2711ea9ab500163e065e43', // 允许设置虚拟竞猜人数

	// 导出
	ALLOW_EXPORT_CAPITAL: '1abeedbcfcf511e89ac1000c29f135eb', // 允许导出资金明细
	ALLOW_EXPORT_MALL_ORDER: 'ef6104b6d07211e99dc43497f658be10', // 允许导出商城订单
	ALLOW_EXPORT_SCHEME_ORDER: 'a248251973f111e9b1a2000c29f135eb', // 允许导出方案订单
	ALLOW_EXPORT_TICKET_ORDER: '6e8f9426ef2611e99ab500163e065e43', // 允许导出赛事门票订单
	ALLOW_EXPORT_COUPON: '105b63c8ceb311e99ab500163e065e43', //允许导出代金券明细

	// 其他
	ALLOW_QUICK_FILTER: 'b4f8a1b108bb11e99ac1000c29f135eb', // 快捷筛选key
	ALLOW_MEMBER_ROLE: '6081cad2fcf511e89ac1000c29f135eb', // 角色及权限
	ALLOW_RED_ENVELOP: '0ff4231fdb6b11e99ab500163e065e43', // 允许给客户发放红包
}

export default {
	// 机构等级
	LEVEL_PLATFORM: 1, // 平台
	LEVEL_OPERATOR: 2, // 运营商
	LEVEL_SERVICE: 4, // 服务商
	LEVEL_AGENCY: 8, // 代理商
	LEVEL_DISTRIBUTOR: 16, // 分销商

	// 微信客服类型
	WECHAT_ASSORT_NUMBER: 1, // 微信号
	WECHAT_ASSORT_QRCODE: 2, // 二维码
}

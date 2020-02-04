import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_MARKET_API;

export default {
	/* ============= 赛事类型 =============  */
	// 获取赛事类型列表
	getAssorts: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dict/event_assorts`);
	},
	// 启用/禁用赛事类型
	enabledAssort: (_id, param = 'enabled') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/dict/event_assort/${_id}/${param}`);
	},

	/* ============= 游戏管理 =============  */
	// 获取游戏列表
	getGames: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dict/games`, obj);
	},
	// 编辑游戏
	updateGame: (_id, obj) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/dict/game/${_id}`, obj);
	},
	// 启用/禁用游戏
	enabledGame: (_id, param = 'enabled') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/dict/game/${_id}/${param}`);
	},

	/* ============= 联赛管理 =============  */
	// 获取联赛列表
	getLeagues: (obj, isPlatform) => {
		if (isPlatform) {
			return net.GET(`${API}/teams/${TeamData.currentId}/dict/leagues`, obj);
		} else {
			return net.GET(`${API}/teams/${TeamData.currentId}/dict/service_leagues`, obj);
		}
	},
	// 创建联赛
	createLeague: (obj) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/dict/league`, obj);
	},
	// 编辑联赛
	updateLeague: (_id, obj, isPlatform) => {
		if (isPlatform) {
			return net.PUT(`${API}/teams/${TeamData.currentId}/dict/league/${_id}`, obj);
		} else {
			return net.PUT(`${API}/teams/${TeamData.currentId}/dict/service_league/${_id}`, obj);
		}
	},

	/* ============= 队伍管理 =============  */
	// 获取队伍列表
	getTeams: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dict/teams`, obj);
	},
	// 创建队伍
	createTeam: (obj) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/dict/team`, obj);
	},
	// 编辑队伍
	updateTeam: (_id, obj) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/dict/team/${_id}`, obj);
	},

	/* ============= 国家管理 =============  */
	// 获取国家列表
	getCountry: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/dict/country`, obj);
	},
	// 创建国家
	createCountry: (obj) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/dict/country`, obj);
	},
	// 编辑国家
	updateCountry: (_id, obj) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/dict/country/${_id}`, obj);
	},

	/* ============= 源赛事 =============  */
	// 获取数据源列表
	getSources: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/sources`, obj);
	},
	// 获取源赛事列表
	getSourceEvents: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/source/events`, obj);
	},
	// 生成赛事
	createMatch: (obj) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/source/events/create`, obj);
	},
	// 匹配赛事
	combineMatch: (_id, obj) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/source/events/match`, obj);
	},

	/* ============= 赛事推送 =============  */
	// 获取赛事推送列表
	getPushes: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/events/publish`, obj);
	},
	// 获取单个赛事推送信息
	getPushSingle: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/event/${id}`);
	},
	// 添加赛事
	addMatch: (obj) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/source/events/new`, obj);
	},
	// 编辑赛事
	editMatch: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}`, data);
	},
	// 推送赛事
	pushMatch: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/publish`);
	},
	// 取消推送
	cancelPushMatch: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/cancel`);
	},
	// 批量推送赛事
	pushMatchBatch: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/events/batch_publish`, data);
	},
	// 批量取消推送
	cancelPushBatch: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/events/batch_cancel`, data);
	},
	// 获取赛事综述
	getEventIntro: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/event/${id}/intro`);
	},
	// 编辑赛事综述
	editEventIntro: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/intro`, data);
	},
	// 编辑赛事属性
	editEventAttribute: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/attribute`, data);
	},

	/* ============= 玩法 =============  */
	// 获取玩法列表
	getSpList: (id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/event/${id}/sp`, data);
	},
	// 批量开盘
	spEnabledBatch: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/sp/enabled`, data);
	},
	// 批量封盘
	spDisabledBatch: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/sp/disabled`, data);
	},
	// 获取自建赛事玩法配置
	getSpConfig: (id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/event/${id}/spconfig`, data);
	},
	// 提交自建赛事玩法配置
	updateSpConfig: (id, data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/publish/event/${id}/spconfig`, data);
	},
	// 编辑赔率
	editSp: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/sp`, data);
	},

	/* ============= 彩果 =============  */
	// 获取彩果列表
	getSettle: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/event/${id}/settle`);
	},
	// 提交彩果
	submitSettle: (id, data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/publish/event/${id}/settle`, data);
	},
	// 编辑彩果审核状态
	updateSettleStatus: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/settle/wait_check`, data);
	},
	// 获取服务商彩果列表
	getServiceSettle: (id, assort) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settle?event_id=${id}&assort=${assort}`);
	},
	// 提交服务商彩果
	submitServiceSettle: (id, data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/event/${id}/settle`, data);
	},

	/* ============= 赛果 =============  */
	// 获取赛果列表
	getEventResults: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/event/${id}/result`);
	},
	// 修改赛果
	updateEventResult: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/result`, data);
	},

	/* ============= 源赔率 =============  */
	// 获取源赔率列表
	getOdds: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/publish/event/${id}/odds`);
	},
	// 切换主数据源
	changeSource: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/publish/event/${id}/odds/switch`);
	},

	/* ============= 玩法配置 =============  */
	// 获取玩法配置列表
	getPlays: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/spconfig`, data);
	},
	// 添加玩法
	addPlay: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/spconfig`, data);
	},
	// 编辑玩法
	editPlay: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/spconfig/update/${id}`, data);
	},
	// 批量启用玩法
	enabledPlayBatch: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/spconfig/enabled`, data);
	},
	// 批量禁用玩法
	disabledPlayBatch: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/spconfig/disabled`, data);
	},

	/* ============= 竞猜订单 =============  */
	// 获取竞猜订单
	getEventOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders`, data);
	},
	// 获取订单统计
	getEventOrderTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders/total`, data);
	},
	// 导出竞猜订单
	exportOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders/export`, data);
	},
	// 导出野子订单
	exportXxeOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders/inplay/export`, data);
	},
	// 获取异常订单统计数据
	getExceptionTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders/exception/total`, data);
	},
	// 提交异常订单
	exceptionOrder: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/orders/exception`, data);
	},
	// 提交异常订单信息
	exceptionInfo: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/orders/exception/info`, data);
	},
	// 获取赛事是否可提交异常订单走盘
	getIsAllowRefund: (_id, assort) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders/exceptions/${_id}?assort=${assort}`);
	},
	// 获取客户待开奖投注额信息
	getWaitingAward: (customer_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/orders/result_pending?customer_id=${customer_id}`);
	},

	/* ============= 赔率调控 =============  */
	// 获取赔率调控列表
	getRiskOdds: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/odds`, data);
	},
	// 调水
	adjust: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/odds/adjust/${id}`, data);
	},
	// 批量调水
	adjustBatch: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/odds/batch_adjust`, data);
	},

	/* ============= 玩法调控 =============  */
	// 获取玩法调控列表
	getRiskPlays: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/sp`, data);
	},
	// 创建
	createRiskPlay: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/risk/sp`, data);
	},
	// 编辑
	updateRiskPlay: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/sp/${id}`, data);
	},
	// 批量启用
	enabledRiskPlay: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/enabled`, data);
	},
	// 批量禁用
	disabledRiskPlay: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/disabled`, data);
	},

	/* ============= 赛事风控 =============  */
	// 获取全局赛事风控列表
	getRiskEventsGlobal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/global`, data);
	},
	// 编辑全局赛事风控信息
	updateRiskEventsGlobal: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/event_global`, data);
	},
	// 获取赛事风控列表
	getRiskEvents: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/events`, data);
	},
	// 创建
	createRiskEvent: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/risk/event`, data);
	},
	// 编辑
	updateRiskEvent: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/event/${id}`, data);
	},
	// 获取赛事风控玩法列表
	getRiskEventSp: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/event_sp`, data);
	},
	// 编辑赛事风控玩法
	updateRiskEventSp: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/event_sp`, data);
	},
	// 获取赛事风控信息
	getRiskEventInfo: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/event`, data);
	},
	// 编辑赛事风控信息
	updateRiskEventInfo: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/event/${id}`, data);
	},
	// 获取代理商风控信息
	getRiskAgentInfo: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/agent_limit/${id}`);
	},
	// 编辑代理商风控信息
	updateRiskAgentInfo: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/agent_limit/${id}`, data);
	},

	/* ============= 赛事等级风控 =============  */
	// 获取赛事等级
	getLevel: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/event_level`);
	},
	// 获取赛事等级 - 风控列表
	getRiskLevel: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/risk_level`, data);
	},
	// 编辑赛事等级 - 风控
	editRiskLevel: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/risk_level/${id}`, data);
	},
	// 创建赛事等级
	createLevel: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/risk/event_level`, data);
	},
	// 编辑赛事等级
	editLevel: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/event_level/${id}`, data);
	},
	// 删除赛事等级
	deleteLevel: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/risk/event_level/${id}`);
	},

	/* ============= 自动调水 =============  */
	// 获取列表
	getEventAdjust: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/risk/event_adjust/${id}`);
	},
	// 编辑调水
	updateEventAdjust: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/risk/event_adjust`, data);
	},
	// 玩法自动调水
	openOrCloseAllowAdjust: (data, param = 'open_adjust') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/sp/${param}`, data);
	},
	// 玩法切换固赔和奖池
	openOrClosePool: (data, param = 'open_pool') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/sp/${param}`, data);
	},
	// 获取调水明细
	getAdjustLogs: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/trading/odds_ratio_details`, data);
	},

	/* ============= 赛事列表 =============  */
	// 获取赛事列表
	getEvents: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/events`, data);
	},
	// 获取单场赛事
	getEventInfo: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/event/${id}/info`);
	},
	// 发布赛事
	releaseEvent: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/release`);
	},
	// 关闭赛事
	closeEvent: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/close`);
	},
	// 标记异常
	abnormalEvent: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/abnormal`, data);
	},
	// 设为人工派奖
	manualLottery: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/manual_lottery`);
	},
	// 标记热门
	signHot: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/sign_hot`);
	},
	// 取消热门标记
	cancelHot: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/cancel_hot`);
	},
	// 标记虚拟竞猜数
	virtualNumber: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/virtual_number`, data);
	},
	// 开启赛事竞猜
	openBet: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/open_bet`, data);
	},
	// 关闭赛事竞猜
	closeBet: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/event/${id}/close_bet`, data);
	},
	// 导出赛事信息
	exportEvent: (obj) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/events/export`, obj);
	},

	/* ============= 赛事列表 - 交易监控 =============  */
	// 获取单个赛事 交易监控 列表
	getEventTrades: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/trading`, data);
	},
	// 获取赔率明细
	getOddsLogs: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/trading/odds_details`, data);
	},

	/* ============= 赛事列表 - 赔率调控 =============  */
	// 获取单个赛事 赔率调控 列表
	getEventOdds: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/odds`, data);
	},
	// 调水
	adjustOdds: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/adjust/${id}`, data);
	},
	// 批量调水
	adjustOddsBatch: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/batch_adjust`, data);
	},
	// 批量显示/隐藏玩法
	enabledOrNotOddsBatch: (data, param = 'enabled') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/${param}`, data);
	},
	// 批量开盘/封盘/暂停玩法
	openOrCloseBetBatch: (data, param = 'open_bet') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/sp/${param}`, data);
	},
	// 全部暂停
	stopBetAll: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/sp/suspend_all`, data);
	},
	// 批量开盘/封盘/暂停选项
	openOrCloseOptionBet: (data, param = 'open_bet') => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/odds/op/${param}`, data);
	},

	/* ============= 赛事列表 - 直播/视频 =============  */
	// 获取单个赛事的 视频 列表
	getVideos: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/videos`, data);
	},
	// 添加视频
	addVideo: (data) => {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/video`, data);
	},
	// 编辑视频
	editVideo: (id, data) => {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/video/${id}`, data);
	},
	// 删除视频
	deleteVideo: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/video/${id}`);
	},

	/* ============= 赛事管控 =============  */
	// 获取赛事管控列表
	getControlsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/controls`, data);
	},
	// 获取赛事管控统计
	getControlsTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/controls/total`, data);
	},

	/* ============= 其他 =============  */
	// 获取玩法分组列表
	getSpGroups: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/sp/groups`);
	},
	// 获取派奖管理列表
	getSettleList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/settles`, data);
	},
	// 设置调控参数
	setBillboard: (data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/events/billboard`, data);
	},
	// 获取微控参数
	getBillboard: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/events/billboard`, data);
	},
}

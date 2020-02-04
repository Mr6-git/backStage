import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_API;
const REPORT_API = process.env.REACT_APP_REPORT_API;
const MARKET_API = process.env.REACT_APP_MARKET_API;
const MARKETING_API = process.env.REACT_APP_MARKETING_API;

export default {
	/* ============= 客户资金分析-资金趋势 ============= */
	// 获取客户资金总览
	getCapitalOverview: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/capital`);
	},
	// 获取客户资金趋势
	getCapitalTrend: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/capital/trend`, data);
	},

	/* ============= 客户资金分析-资金流向 ============= */
	// 获取资金流向指标
	getCapitalFlowOverview: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/capital_flow`, data);
	},
	// 获取资金流入流出分布
	getCapitalFlowTrend: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/capital_flow/trend`, data);
	},
	// 获取竞猜金额统计(按游戏)
	getBetGame: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/bet/game`, data);
	},
	// 获取出金统计(按渠道)
	getExpenseByChannel: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/expense/channel`, data);
	},
	// 获取出金趋势
	getExpenseTrend: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/expense/trend`, data);
	},
	// 获取客户增长明细
	getExpenseTrendList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/trend_list`, data);
	},

	/* ============= 客户数据分析-客户增长 ============= */
	// 获取客户增长总览
	getCustomerOverview: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer`);
	},
	// 获取客户趋势
	getCustomerTrend: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/trend`, data);
	},

	/* ============= 客户数据分析-客户属性 ============= */
	// 获取客户身份占比
	getCustomerIdentityRatio: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/attribute/identity_ratio`);
	},
	// 获取客户性别占比
	getCustomerSexRatio: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/attribute/sex_ratio`);
	},
	// 获取客户年龄分布
	getCustomerAgeDistribution: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/attribute/age_distribution`);
	},
	// 获取客户等级占比
	getCustomerLevelRatio: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/attribute/level_ratio`);
	},
	// 获取客户地域分布
	getCustomerRegionDistribution: () => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/attribute/region_distribution`);
	},

	/* ============= 客户数据分析-充值用户分析 ============= */
	// 获取充值客户指标
	getCustomerRechargeMonth: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/recharge_month`, data);
	},
	// 昨日充值客户统计
	getCustomerRechargeDay: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/recharge_day`, data);
	},
	// 获取充值客户数趋势
	getCustomerRechargeTrend: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/recharge_trend`, data);
	},
	// 获取充值客户资金趋势
	getCustomerCapitalTrend: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/customer/capital_trend`, data);
	},

	/* ============= 赛事数据分析 ============= */
	// 获取赛事数据总览
	getEventScan: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event`, data);
	},
	// 获取投注次数
	getEventBet: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/bet`, data);
	},
	// 获取投注金额
	getEventBetTotal: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/bet_total`, data);
	},
	// 获取风险等级
	getEventRisk: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/risk`, data);
	},
	// 获取赛事趋势
	getEventTrend: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/trend`, data);
	},
	// 获取数据明细
	getEventTrendList: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/trend_list`, data);
	},
	// 获取数据明细（详情列表）
	getEventDetail: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/detail`, data);
	},
	// 获取数据明细（详情列表 统计）
	getEventDetailTotal: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/event/detail_total`, data);
	},

	/* ============= 赛事盈亏报表 ============= */
	// 获取赛事盈亏总览
	getProfitScan: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/order`, data);
	},
	// 获取赛事盈亏趋势
	getProfitTrend: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/order/trend`, data);
	},
	// 导出赛事盈亏趋势
	exportProfitTrend: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/order/export`, data);
	},
	// 获取赛事盈亏统计(按游戏类型)
	getProfitByGame: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/order/game`, data);
	},
	// 获取赛事盈亏统计(按赛事)
	getProfitByEvent: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/reports/order/event`, data);
	},
	// 导出赛事盈亏统计
	exportEventProfit: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/events/export`, data);
	},
	// 获取盈亏数据明细(按月/按日)
	getProfitTrendList: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/order/trend_list`, data);
	},
	// 获取盈亏数据明细(按时)
	getProfitDayList: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/reports/order/trend_list_day`, data);
	},

	/* ============= 联赛分析 ============= */
	// 获取联赛投注总览
	getLeagueScan: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/bettotal`, data);
	},
	// 获取联赛盈亏统计(按赛事)
	getLeagueProfitLoss: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/event`, data);
	},
	// 获取联赛机构盈利排行
	getLeagueRank: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/department/rank`, data);
	},
	// 获取联赛机构投注占比
	getLeagueBet: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/department/bet_ratio`, data);
	},
	// 获取联赛数据明细(按日)
	getLeagueTrend: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/trend_list`, data);
	},
	// 获取联赛赛事列表
	getEventByLeague: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/event/list`, data);
	},
	// 获取列表
	getLeagueDetailList: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/league/list`, data);
	},

	/* ============= 分销商-运营报表 ============= */
	// 获取部门运营报表
	getDeptOperatorReport: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/users/department`, data);
	},
	// 获取来源运营报表
	getSourceOperatorReport: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/users/source`, data);
	},
	// 获取员工业绩排名表
	getPerformanceRanking: (data, ratio) => {
		let url = `${API}/teams/${TeamData.currentId}/reports/users/rank`;
		if (ratio == 30) url += `_ratio`;
		return net.GET(url, data);
	},
	// 导出排名报表
	exportPerformanceRanking: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/users/export`, data);
	},

	/* ============= 推广渠道分析 ============= */
	// 时段详情
	getChannelsDetails: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/reports/channels/hour_details`, data);
	},
	// 渠道列表-TOP10 渠道
	getChannelsTop: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/reports/channels/top`, data);
	},
	// 渠道列表-数据明细
	getChannelsReport: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/reports/channels`, data);
	},
	// 渠道列表-单个渠道数据明细
	getChannelsRSingle: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/reports/channels/single`, data);
	},

	/* ============= 代理商报表 ============= */
	// 数据明细 - 服务商合计
	getServicerTotal: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/servicer_total`, data);
	},
	// 数据明细 - 展开子项
	getAgencyTotal: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/agent_total`, data);
	},
	// 趋势 - 折线图
	getAgencyChart: (data) => {
		return net.GET(`${REPORT_API}/teams/${TeamData.currentId}/agent_chart`, data);
	},

	/* ============= 数据看板 ============= */
	// 获取当前赛事列表
	getBoardEvent: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/kanban/event/list`, data);
	},
	// 获取赛事信息
	getBoardEventInfo: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/kanban/event/detail`, data);
	},
	// 获取赛事详情(客户竞猜排行)
	getBoardCustomerRank: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/kanban/event/detail_customer_rank`, data);
	},
	// 获取赛事详情(盘口竞猜排行)
	getBoardSpRank: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/kanban/event/detail_sp_rank`, data);
	},
	// 获取竞猜排行
	getBoardRank: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/kanban/event/rank`, data);
	},
	// 今日概况
	getBoardTotal: (data) => {
		return net.GET(`${MARKET_API}/teams/${TeamData.currentId}/reports/kanban/event/total`, data);
	},
	// 今日概况(新增客户/异常客户)
	getCustomerTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/reports/kanban/event/total`, data);
	},
}

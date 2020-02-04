import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_API;

export default {
	/* =============  商品订单 =============  */
	// 获取商品订单
	getGoodsOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods`, data);
	},
	// 获取商品订单统计
	getGoodsTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods_total`, data);
	},
	// 审核通过
	goodsAuditPass: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${_id}/audit_pass`, data);
	},
	// 审核拒绝
	goodsAuditRefuse: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${_id}/audit_refuse`, data);
	},
	// 同意退款
	goodsAgreeRefund: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${_id}/agree_refund`, data);
	},
	// 获取商品当前价格
	getGoodsPrice: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${_id}/price`);
	},
	// 获取当前商品税率
	getGoodsTax: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${_id}/tax`);
	},
	// 导出数据
	exportGoodsOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods_export`, data);
	},
	// 获取单个订单详情
	getCocogcGoodsDetail: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${id}`);
	},

	/* =============  信用卡还款订单 =============  */
	// 获取信用卡还款订单
	getCreditOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/credits`, data);
	},
	// 获取信用卡还款单统计
	getCreditTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/credits_total`, data);
	},
	// 审核通过
	creditAuditPass: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${_id}/audit_pass`, data);
	},
	// 审核拒绝
	creditAuditRefuse: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${_id}/audit_refuse`, data);
	},
	// 同意退款
	creditAgreeRefund: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${_id}/agree_refund`, data);
	},
	// 异常处理
	creditAbnormal: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${_id}/handle_exception`, data);
	},
	// 导出数据
	exportCreditOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/credits/export`, data);
	},
	// 获取单个订单详情
	getCreditDetail: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/credit/${id}`);
	},
	// 确认异常订单已处理
	confirmHandle: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${id}/confirm_handle`, data);
	},
	// 确认异常订单已完成
	confirmFinish: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${id}/confirm_finish`, data);
	},
	/* =============  黄金兑换回购订单 =============  */
	// 获取黄金兑换回购订单
	getGoldOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/golds`, data);
	},
	// 获取黄金兑换回购单统计
	getGoldTotal: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/golds_total`, data);
	},
	// 审核通过
	goldAuditPass: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/gold/${_id}/audit_pass`, data);
	},
	// 审核拒绝
	goldAuditRefuse: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/gold/${_id}/audit_refuse`, data);
	},
	// 同意退款
	goldAgreeRefund: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/gold/${_id}/agree_refund`, data);
	},
	// 异常处理
	goldAbnormal: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/gold/${_id}/handle_exception`, data);
	},
	// 导出数据
	exportGoldOrder: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/golds/export`, data);
	},
	// 获取黄金价格
	getGoldPrice: (type) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/golds/price?type=${type}`);
	},
	// 获取椰子分税率
	getCocogcTax: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc/${_id}/tax`);
	},
	// 获取单个信息详情
	getGoldDetail: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/gold/${_id}`);
	},
	// 获取商品物流信息
	getOrderTrack: (_id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/order/cocogc_goods/${_id}/order_track`);
	},
	// 添加备注
	addRemark: (_id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/order/credit/${_id}/remark`, data);
	},
	/* =============  门票管理 =============  */
	// 获取门票列表
	getTicketsList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/tickets`, data);
	},
	// 获取单个门票信息
	getTicket: (id) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/ticket/${id}`);
	},
	// 添加门票
	addTicket: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/mall/ticket`, data);
	},
	// 编辑门票信息
	editTicket: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket/${id}`, data);
	},
	// 删除门票
	delTicket: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/mall/ticket/${id}`);
	},
	// 启用门票
	openTicket: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket/${id}/enabled`);
	},
	// 禁用门票
	disableTicket: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket/${id}/disabled`);
	},
	// 获取场次列表
	getScenesList: (ticket_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/ticket_scenes/${ticket_id}`, data);
	},
	// 添加场次
	addScene: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/mall/ticket_scene`, data);
	},
	// 编辑场次信息
	editScene: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket_scene/${id}`, data);
	},
	// 删除场次
	delScene: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/mall/ticket_scene/${id}`);
	},
	// 获取票档列表
	getGearsList: (ticket_id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/ticket_grades/${ticket_id}`, data);
	},
	// 添加票档列表
	addGear: (data) => {
		return net.POST(`${API}/teams/${TeamData.currentId}/mall/ticket_grade`, data);
	},
	// 编辑票档列表
	editGear: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket_grade/${id}`, data);
	},
	// 删除票档列表
	delGear: (id) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/mall/ticket_grade/${id}`);
	},
	// 批量删除票档
	delBatchGear: (ids) => {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/mall/ticket_grade_batch/${ids}`);
	},
	// 禁用票档
	enabledGear: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket_grade/${id}/disabled`);
	},
	// 启用票档
	openGear: (id) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket_grade/${id}/enabled`);
	},
	// 获取门票订单列表
	getOrderList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/ticket_orders`, data);
	},
	// 导出门票订单列表
	exportOrderList: (data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/mall/ticket_orders/export`, data);
	},
	// 下载门票列表
	downloadExcelFile: (id, data) => {
		return net.GET(`${API}/teams/${TeamData.currentId}/funds/capital_details/export/${id}`, data);
	},
	// 增加减少票档库存
	autoStock: (id, data) => {
		return net.PUT(`${API}/teams/${TeamData.currentId}/mall/ticket_grade/${id}/stock`, data);
	},
}
import net from '@/net'
import TeamData from '@/data/Team';

const API = process.env.REACT_APP_WAWAJI_API;

export default {
	/* =============娃娃机 ============= */
	//获取娃娃管理列表
	getMerchants: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/wawas`, obj);
	},
	//禁用娃娃
	disabledWawa: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/disabled/${id}`)
	},
	//启用娃娃
	enabledWawa: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/enabled/${id}`)
	},
	//删除娃娃
	deleteWawa: (id)=> {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/wawa/${id}`)
	},
	//获取娃娃管理详情
	singleWawa: (id)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/single/${id}`)
	},
	//激活记录列表
	activationsWawa: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/activations`, obj)
	},
	//兑换记录列表
	exchangesWawa: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/exchanges`, obj)
	},
	//锦鲤娃娃管理列表
	luckysWawa: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/luckys`, obj)
	},
	//代金券管理
	couponManage: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/coupons`, obj)
	},
	//导出代金券列表
	couponExport: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/coupon/export`, obj)
	},
	//代金券作废
	couponInvalid: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/coupon/invalid/${id}`)
	},
	//新增优惠券
	addCoupon: (obj)=> {
		return net.POST(`${API}/teams/${TeamData.currentId}/coupon`, obj)
	},
	//代金券使用记录
	couponUse: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/coupon/records`, obj)
	},
	//代金券结算记录
	couponSet: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/coupon/settlements`, obj)
	},
	//模板管理
	templates: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/templates`, obj)
	},
	//禁用模板
	tmpDisabled: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/template/disabled/${id}`)
	},
	//启用模板
	temEnabled: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/template/enabled/${id}`)
	},
	//删除模板
	deleteTemplate: (id)=> {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/template/${id}`)
	},
	//新增模板
	addTemplates: (obj)=> {
		return net.POST_UPLOAD(`${API}/teams/${TeamData.currentId}/template`, obj)
	},
	//编辑模板
	editTemplate: (id,obj)=> {
		return net.PUT_UPLOAD(`${API}/teams/${TeamData.currentId}/template/update/${id}`, obj);
	},
	//商户列表
	merchantsList: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/merchants`,obj)
	},
	//添加商户
	addMerchants: (obj)=> {
		return net.POST(`${API}/teams/${TeamData.currentId}/merchant`,obj)
	},
	//启用商户
	enabledMerchants: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/merchant/enabled/${id}`)
	},
	//禁用商户
	disabledMerchants: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/merchant/disabled/${id}`)
	},
	//编辑商户
	editMerchant: (id,obj)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/merchant/update/${id}`, obj)
	},
	//分组列表-商户
	groupsMerchants: ()=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/merchant/groups`)
	},
	//添加分组-商户
	addGroup: (obj)=> {
		return net.POST(`${API}/teams/${TeamData.currentId}/merchant/group`, obj)
	},
	//修改分组-商户
	putGroup: (id,obj)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/merchant/group/${id}`, obj)
	},
	//删除分组-商户
	deleteGroup: (id)=> {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/merchant/group/${id}`)
	},
	//娃娃机列表
	wawajisList: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/wawajis`, obj)
	},
	//添加娃娃机
	addWawaji: (obj)=> {
		return net.POST(`${API}/teams/${TeamData.currentId}/wawaji`, obj)
	},
	//删除娃娃机
	deleteWawaji: (id)=> {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/wawajis/${id}`)
	},
	//启用娃娃机
	enabledWawaji: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/wawaji/enabled/${id}`)
	},
	//禁用娃娃机
	disabledWawaji: (id)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/wawaji/disabled/${id}`)
	},
	//编辑娃娃机
	editWawaji: (id,obj)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/wawaji/update/${id}`, obj)
	},
	//分组列表-娃娃机
	groupsWawa: ()=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/wawaji/groups`)
	},
	//添加分组-娃娃机
	addWawaGroup: (obj)=> {
		return net.POST(`${API}/teams/${TeamData.currentId}/wawaji/group`, obj)
	},
	//修改分组-娃娃机
	editWawaGroup: (id,obj)=> {
		return net.PUT(`${API}/teams/${TeamData.currentId}/wawaji/group/${id}`, obj)
	},
	//删除分组-娃娃机
	deleteWawaGroup: (id)=> {
		return net.DELETE(`${API}/teams/${TeamData.currentId}/wawaji/group/${id}`)
	},
	//交易流水
	wawaBill: (obj)=> {
		return net.GET(`${API}/teams/${TeamData.currentId}/trading_flows`, obj)
	}
}

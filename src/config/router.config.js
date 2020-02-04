import React from 'react';
import Enum from '@/enum'
import Loader from '@/component/Loader';
const prev = '/team/:id';

let resultList = [
	{
		path: prev,
		exact: true,
		redirect: `${prev}/overview`
	},
	{
		name: '运营管理',
		icon: 'icon-yunying',
		routes: [
			{
				path: `${prev}/overview`,
				name: '账户概况',
				component: Loader(() => import('@/page/application/account/Overview')),
			},
			{
				name: '账户管理',
				moduleKey: 'b8dd2a8ca3cf11e9879f00163e065e43',
				routes: [
					{
						path: `${prev}/capital/agency/capital_details`,
						name: '收支明细',
						component: Loader(() => import('@/page/application/operation/capital/agency/capitalDetails/Index')),
						moduleKey: '26d8c07e7ed311e99531000c29f135eb'
					},
					{
						path: `${prev}/capital/agency/cashing_manage`,
						name: '充值提现', // 服务商/分销商
						component: Loader(() => import('@/page/application/operation/capital/agency/cashingManage/Index')),
						moduleKey: '0d70ea187e0211e99531000c29f135eb'
					},
					{
						path: `${prev}/capital/operator/cashing_manage`,
						name: '充值提现审核', // 运营商
						component: Loader(() => import('@/page/application/operation/capital/operator/cashingManage/Index')),
						moduleKey: '0d70ea187e0211e99531000c29f135eb'
					}
				]
			},
			{
				path: `${prev}/customer`,
				name: '客户管理',
				component: Loader(() => import('@/page/application/operation/customer/Index')),
				moduleKey: 'fdb153c8fcf411e89ac1000c29f135eb'
			},
			{
				name: '客户资金',
				moduleKey: '168c484afcf511e89ac1000c29f135eb',
				routes: [
					{
						path: `${prev}/capital/virtual_details`,
						name: '虚拟币流水',
						component: Loader(() => import('@/page/application/operation/capital/virtualDetails/Index')),
						moduleKey: 'ba23f19a9fcc11e9879f00163e065e43'
					},
					{
						path: `${prev}/capital/bounty_details`,
						name: '积分流水',
						component: Loader(() => import('@/page/application/operation/capital/bountyDetails/Index')),
						moduleKey: 'bfd837479fcc11e9879f00163e065e43'
					},
					{
						path: `${prev}/capital/capital_details`,
						name: '资金流水',
						component: Loader(() => import('@/page/application/operation/capital/capitalDetails/Index')),
						moduleKey: 'c4d8242f9fcc11e9879f00163e065e43'
					},
					{
						path: `${prev}/capital/reverse_manage`,
						name: '红冲蓝补管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/capital/reverseManage/Index')),
						moduleKey: 'cfcfe2f9a1fa11e9879f00163e065e43'
					}
				]
			},
			{
				name: '合规管理',
				moduleKey: '51fa62f773ed11e9b1a2000c29f135eb',
				routes: [
					{
						path: `${prev}/compliance/customer/query`,
						name: '客户查询',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/customer/query/Index')),
						moduleKey: '3a36a80efcf511e89ac1000c29f135eb'
					},
					{
						path: `${prev}/compliance/customer/feedbacks`,
						name: '客户反馈',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/feedbacks/Index')),
						moduleKey: 'a833d4597dd511e99531000c29f135eb'
					},
					{
						path: `${prev}/compliance/recharge_details`,
						name: '三方支付查询',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/rechargeDetails/Index')),
						moduleKey: '8487cedacf7c11e99ab500163e065e43'
					},
					{
						path: `${prev}/compliance/customer/register`,
						name: '客户注册审核',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/customer/register/Index')),
						moduleKey: '5798ae4973ed11e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/compliance/customer/nickname`,
						name: '客户昵称审核',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/customer/nickname/Index')),
						moduleKey: '5c41c0f973ed11e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/compliance/customer/avatar`,
						name: '客户头像审核',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/customer/avatar/Index')),
						moduleKey: '60dd629a73ed11e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/compliance/customer/verified`,
						name: '实名认证审核',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/operation/compliance/customer/verified/Index')),
						moduleKey: '3eab4b01fcf511e89ac1000c29f135eb'
					},
					{
						path: `${prev}/compliance/download_logs`,
						name: '下载日志',
						
						component: Loader(() => import('@/page/application/operation/compliance/downloadLogs/Index')),
						moduleKey: 'ee5e6cd6045811ea9ab500163e065e43'
					},
					{
						path: `${prev}/compliance/visit_astrict`,
						name: '访问限制',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/account/visitAstrict/Index')),
					},
				]
			},
			// {
			// 	name: '消息中心',
			// 	routes: [
			// 		{
			// 			path: `${prev}/messages`,
			// 			name: '站内信',
			// 			component: Loader(() => import('@/page/application/account/messages/Index')),
			// 			moduleKey: 'eeb6f64cfcf411e89ac1000c29f135eb'
			// 		},
			// 		{
			// 			path: `${prev}/message_settings`,
			// 			name: '接收管理',
			// 			component: Loader(() => import('@/page/application/account/messages/Settings')),
			// 			moduleKey: 'f4621f07fcf411e89ac1000c29f135eb'
			// 		}
			// 	]
			// },
			{
				path: `${prev}/receptionMsg`,
				name: '钉钉接收管理',
				component: Loader(() => import('@/page/application/account/receptionMsg/Index')),
			},
			{
				path: `${prev}/event_logs`,
				name: '事件日志',
				isEnd: true,
				component: Loader(() => import('@/page/application/account/eventLogs/Index')),
				moduleKey: 'f8d58292fcf411e89ac1000c29f135eb'
			}
		]
	},
	{
		path: `${prev}/personal/:moduleId`,
		// name: '个人管理',
		icon: 'icon--8',
		component: Loader(() => import('@/page/application/personal/Index')),
		routes: [
			{
				path: `${prev}/personal/settings`,
				name: '个人设置',
				component: Loader(() => import('@/page/application/personal/settings/Index'))
			},
			{
				path: `${prev}/personal/access_logs`,
				name: '访问日志',
				component: Loader(() => import('@/page/application/personal/accessLogs/Index'))
			},
			
		]
	},
	{
		name: '赛事中心',
		icon: 'icon-saishi',
		routes: [
			{
				path: `${prev}/billboard/indoor1`,
				// name: '室内投屏管控',
				component: Loader(() => import('@/page/application/billboard/indoor1/Index')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			},
			{
				path: `${prev}/billboard/control`,
				// name: '室外投屏-微控',
				component: Loader(() => import('@/page/application/billboard/Control')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			},
			{
				path: `${prev}/billboard/outdoor1`,
				// name: '室外投屏-A1(有赔率)',
				component: Loader(() => import('@/page/application/billboard/Billboard')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			},
			{
				path: `${prev}/billboard/outdoor2`,
				// name: '室外投屏-A1(无赔率)',
				component: Loader(() => import('@/page/application/billboard/Billboard2')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			},
			{
				path: `${prev}/billboard/outdoor3`,
				// name: '室外投屏-A1(无赔率)',
				component: Loader(() => import('@/page/application/billboard/Billboard3')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			},
			{
				path: `${prev}/billboard/outdoor4`,
				component: Loader(() => import('@/page/application/billboard/Billboard4')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			},
			{
				path: `${prev}/billboard`,
				name: '看板管理',
				component: Loader(() => import('@/page/application/billboard/Index')),
				moduleKey: 'cd4ee05a91b111e9879f00163e065e43'
			}
		]
	},
	{
		name: '媒体管理',
		icon: 'icon-meiti',
		routes: [
			{
				name: '文章管理',
				routes: [
					{
						path: `${prev}/media/article/list`,
						name: '文章列表',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/article/article/Index')),
						moduleKey: '190c614973f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/article/categorys`,
						name: '分类管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/article/category/Index')),
						moduleKey: '1e322ff173f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/article/tags`,
						name: '标签管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/article/tags/Index')),
						moduleKey: '234b886773f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/article/author`,
						name: '作者管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/article/author/Index')),
						moduleKey: '296d6e1273f111e9b1a2000c29f135eb'
					}
				]
			},
			{
				name: '方案管理',
				routes: [
					{
						path: `${prev}/media/scheme/list`,
						name: '方案列表',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/scheme/scheme/Index')),
						moduleKey: '2dd0b7bc73f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/scheme/event`,
						name: '方案创建',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/scheme/create/Index')),
						moduleKey: '2dd0b7bc73f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/scheme/expert`,
						name: '专家管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/scheme/expert/Index')),
						moduleKey: '9e2d406273f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/scheme/categorys`,
						name: '分类管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/scheme/category/Index')),
						moduleKey: '3652689873f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/scheme/order`,
						name: '订单管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/scheme/order/Index')),
						moduleKey: 'a248251973f111e9b1a2000c29f135eb'
					}
				]
			},
			{
				name: '视频管理',
				routes: [
					{
						path: `${prev}/media/video/list`,
						name: '视频列表',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/video/video/Index')),
						moduleKey: 'a73704a073f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/video/categorys`,
						name: '分类管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/video/category/Index')),
						moduleKey: 'ab875c1473f111e9b1a2000c29f135eb'
					},
					{
						path: `${prev}/media/video/tags`,
						name: '标签管理',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/video/tags/Index')),
						moduleKey: 'b270cd7473f111e9b1a2000c29f135eb'
					}
				]
			},
			{
				name: '直播管理',
				routes: [
					{
						path: `${prev}/media/live/list`,
						name: '直播列表',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/media/live/liveList/Index')),
						// moduleKey: 'a73704a073f111e9b1a2000c29f135eb'
					}
				]
			},
			{
				path: `${prev}/media/specials`,
				name: '专题管理',
				component: Loader(() => import('@/page/application/media/specials/Index')),
				// moduleKey: '204e923cadb511e9879f00163e065e43'
			},
		]
	},
	{
		name: '商城管理',
		icon: 'icon-shangcheng',
		routes: [
			{
				name: '订单管理',
				routes: [
					{
						path: `${prev}/mall/order/list`,
						name: '商品订单',
						component: Loader(() => import('@/page/application/mall/order/goods/Index')),
						moduleKey: '03474bebcfc311e99ab500163e065e43'
					},
					{
						path: `${prev}/mall/order/credit_card`,
						name: '信用卡还款',
						component: Loader(() => import('@/page/application/mall/order/creditCard/Index')),
						moduleKey: '5cfa8c18a2ad11e9879f00163e065e43'
					},
					{
						path: `${prev}/mall/order/gold`,
						name: '黄金兑换',
						component: Loader(() => import('@/page/application/mall/order/gold/Index')),
						moduleKey: '6aa538b7a2ad11e9879f00163e065e43'
					}
				]
			},
			{
				name: '门票管理',
				routes: [
					{
						path: `${prev}/mall/ticket/ticket_list`,
						name: '门票列表',
						component: Loader(() => import('@/page/application/mall/tickets/ticketList/Index')),
						moduleKey: '6b8a82acef2011e99ab500163e065e43'
					},
					{
						path: `${prev}/mall/ticket/ticket_order`,
						name: '门票订单',
						component: Loader(() => import('@/page/application/mall/tickets/ticketOrder/Index')),
						moduleKey: '6b8a82acef2011e99ab500163e065e43'
					},
				]
			}
		]
	},
	{
		name: '营销管理',
		icon: 'icon-yingxiao',
		routes: [
			{
				path: `${prev}/marketing/red_envelop`,
				name: '红包管理',
				component: Loader(() => import('@/page/application/marketing/redEnvelop/Index')),
				moduleKey: '204e923cadb511e9879f00163e065e43'
			},
			// {
			// 	path: `${prev}/marketing/wechat`,
			// 	name: '微信客服管理',
			// 	component: Loader(() => import('@/page/application/marketing/wechat/Index')),
			// 	moduleKey: '1047b815af7b11e9879f00163e065e43'
			// },
			{
				path: `${prev}/marketing/promotion`,
				name: '推广渠道',
				component: Loader(() => import('@/page/application/marketing/promotion/Index')),
				moduleKey: 'caec3badd53011e99ab500163e065e43'
			},
			{
				path: `${prev}/marketing/order/ticket_apply`,
				name: '兑换门票',
				component: Loader(() => import('@/page/application/marketing/apply/ticket/Index')),
				moduleKey: '4488381811a511ea9ab500163e065e43'
			},
			{
				path: `${prev}/marketing/captcha_code`,
				name: '手机验证码',
				component: Loader(() => import('@/page/application/marketing/CaptchaCode')),
				moduleKey: 'cb679283d51f11e99ab500163e065e43'
			},
			{
				path: `${prev}/marketing/invite`,
				name: '邀请列表',
				component: Loader(() => import('@/page/application/marketing/invite/Index')),
				// moduleKey: 'cb679283d51f11e99ab500163e065e43'
			},
			{
				path: `${prev}/marketing/cdkey`,
				name: '激活码管理',
				component: Loader(() => import('@/page/application/marketing/cdkey/Index')),
				// moduleKey: 'cb679283d51f11e99ab500163e065e43'
			}
		]
	},
	{
		name: '锦鲤娃娃',
		icon: 'icon-wawaji',
		routes: [
			{
				name: '娃娃管理',
				routes: [
					{
						path: `${prev}/coupon/baby_manage`,
						name: '娃娃列表',
						component: Loader(() => import('@/page/application/catcher/wawa/wawas/Index')),
						moduleKey: '1e1fa1caca4711e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/carp_manage`,
						name: '锦鲤娃娃列表',
						component: Loader(() => import('@/page/application/catcher/wawa/jinli/Index')),
						moduleKey: '31b38a88ca4811e99ab500163e065e43'
					}
				]
			},
			{
				name: '代金券管理',
				routes: [
					{
						path: `${prev}/coupon/exchange_manage`,
						name: '兑换列表',
						component: Loader(() => import('@/page/application/catcher/exchange/Index')),
						moduleKey: '0151e5c9ca4811e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/coupons_manage`,
						name: '代金券列表',
						component: Loader(() => import('@/page/application/catcher/coupon/coupons/Index')),
						moduleKey: '4f77bbcaca4811e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/coupons_use`,
						name: '代金券使用记录',
						component: Loader(() => import('@/page/application/catcher/coupon/useDetails/Index')),
						moduleKey: '7beee4f6ca4811e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/coupons_settlement`,
						name: '代金券结算记录',
						component: Loader(() => import('@/page/application/catcher/coupon/settleDetails/Index')),
						moduleKey: '8e94c49dca4811e99ab500163e065e43'
					}
				]
			},
			{
				name: '资金管理',
				routes: [
					{
						path: `${prev}/coupon/business_bill`,
						name: '商户资金管理',
						component: Loader(() => import('@/page/application/catcher/merchant/capitalDetails/Index')),
						moduleKey: '9f6a5546ca4811e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/client_bill`,
						name: '客户资金管理',
						component: Loader(() => import('@/page/application/catcher/customer/capitalDetails/Index')),
						moduleKey: '9f6a5546ca4811e99ab500163e065e43'
					}
				]
			},
			{
				name: '配置管理',
				routes: [
					{
						path: `${prev}/coupon/template_manage`,
						name: '模板管理',
						component: Loader(() => import('@/page/application/catcher/wawa/template/Index')),
						moduleKey: 'e4032e10ca4811e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/business_manage`,
						name: '商户管理',
						component: Loader(() => import('@/page/application/catcher/merchant/merchants/Index')),
						moduleKey: 'fdcaf25cca4811e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/wawaji_manage`,
						name: '娃娃机管理',
						component: Loader(() => import('@/page/application/catcher/wawa/wawajis/Index')),
						moduleKey: '2910a821ca4911e99ab500163e065e43'
					},
					{
						path: `${prev}/coupon/params`,
						name: '参数配置',
						level: Enum.LEVEL_AGENCY,
						component: Loader(() => import('@/page/application/catcher/params/Index')),
						moduleKey: '1450c95c73f111e9b1a2000c29f135eb'
					}
				]
			}
		]
	},
	{
		name: '统计报表',
		icon: 'icon-baobiao',
		routes: [
			{
				path: `${prev}/report/agency/overview`,
				name: '代理商报表',
				level: Enum.LEVEL_AGENCY,
				component: Loader(() => import('@/page/application/report/agency/Index')),
				moduleKey: '2ca64287de9411e99ab500163e065e43'
			},
			{
				path: `${prev}/report/distributor/overview`,
				name: '分销商报表',
				level: Enum.LEVEL_DISTRIBUTOR,
				component: Loader(() => import('@/page/application/report/agency/Index')),
				moduleKey: '2ca64287de9411e99ab500163e065e43'
			},
			{
				path: `${prev}/report/servicer/customer_capital`,
				name: '资金分析',
				level: Enum.LEVEL_AGENCY,
				component: Loader(() => import('@/page/application/report/servicer/customerCapital/Index')),
				moduleKey: 'ffe405f1d86011e99ab500163e065e43'
			},
			{
				path: `${prev}/report/servicer/customer_analysis`,
				name: '客户分析',
				level: Enum.LEVEL_AGENCY,
				component: Loader(() => import('@/page/application/report/servicer/customerAnalysis/Index')),
				moduleKey: '1f967e2fd86111e99ab500163e065e43'
			},
			// {
			// 	path: `${prev}/report/servicer/event_analysis`,
			// 	name: '赛事分析',
			// 	level: Enum.LEVEL_AGENCY,
			// 	component: Loader(() => import('@/page/application/report/servicer/eventAnalysis/Index')),
			// 	moduleKey: '39d476aed86111e99ab500163e065e43'
			// },
			{
				path: `${prev}/report/distributor/operator_report`,
				name: '运营报表',
				component: Loader(() => import('@/page/application/report/distributor/operatorReport/Index')),
				moduleKey: 'e621914cd86111e99ab500163e065e43'
			},
			{
				path: `${prev}/report/distributor/performance_ranking`,
				name: '业绩排行',
				component: Loader(() => import('@/page/application/report/distributor/performanceRanking/Index')),
				moduleKey: '5e56cdfdd86211e99ab500163e065e43'
			},
			{
				path: `${prev}/report/servicer/promotion_analysis`,
				name: '渠道分析',
				component: Loader(() => import('@/page/application/report/servicer/promotionAnalysis/Index')),
				moduleKey: '2ca64287de9411e99ab500163e065e43'
			},
			{
				path: `${prev}/report/servicer/withhold`,
				name: '代扣代缴明细',
				component: Loader(() => import('@/page/application/report/withhold/Index'))
			}
		]
	},
	{
		name: '系统设置',
		icon: 'icon-xitong',
		routes: [
			{
				path: `${prev}/:moduleId(members|roles)`,
				name: '团队管理',
				isEnd: true,
				component: Loader(() => import('@/page/application/settings/teams/Index')),
				routes: [
					{
						path: `${prev}/members`,
						name: '成员',
						component: Loader(() => import('@/page/application/settings/teams/members/Index')),
						moduleKey: '5b5f86dcfcf511e89ac1000c29f135eb',
						key: 'members'
					},
					{
						path: `${prev}/roles`,
						name: '角色',
						component: Loader(() => import('@/page/application/settings/teams/roles/Index')),
						moduleKey: '6081cad2fcf511e89ac1000c29f135eb',
						key: 'roles'
					}
				]
			},
			{
				path: `${prev}/agencys/distributor`,
				name: '分销商管理',
				level: Enum.LEVEL_DISTRIBUTOR,
				component: Loader(() => import('@/page/application/settings/agencys/distributor/Index')),
				moduleKey: '6530212afcf511e89ac1000c29f135eb'
			},
			{
				path: `${prev}/agencys/distributor`,
				name: '代理商管理',
				level: Enum.LEVEL_AGENCY,
				component: Loader(() => import('@/page/application/settings/agencys/distributor/Index')),
				moduleKey: '6530212afcf511e89ac1000c29f135eb'
			},
			{
				path: `${prev}/agencys/servicer`,
				name: '服务商管理',
				level: Enum.LEVEL_SERVICE,
				component: Loader(() => import('@/page/application/settings/agencys/servicer/Index')),
				moduleKey: '6530212afcf511e89ac1000c29f135eb'
			},
			{
				path: `${prev}/agencys/operator`,
				name: '运营商管理',
				level: Enum.LEVEL_OPERATOR,
				component: Loader(() => import('@/page/application/settings/agencys/operator/Index')),
				moduleKey: '6530212afcf511e89ac1000c29f135eb'
			},
			{
				path: `${prev}/settings/announcements`,
				name: '公告管理',
				component: Loader(() => import('@/page/application/settings/announcements/Index')),
				moduleKey: '56a05cbf73ee11e9b1a2000c29f135eb'
			},
			{
				path: `${prev}/settings/field_editor`,
				name: '字段编辑器',
				component: Loader(() => import('@/page/application/settings/fieldEditor/Index')),
				moduleKey: '69f766cafcf511e89ac1000c29f135eb'
			},
			{
				path: `${prev}/settings/member_levels`,
				name: '会员等级',
				component: Loader(() => import('@/page/application/settings/memberLevels/Index')),
				moduleKey: '5bfdeef973ee11e9b1a2000c29f135eb'
			},
			{
				path: `${prev}/settings/apps`,
				name: '应用管理',
				component: Loader(() => import('@/page/application/settings/apps/apps/Index')),
				moduleKey: '619be8b773ee11e9b1a2000c29f135eb'
			},
			{
				path: `${prev}/settings/release_logs`,
				name: '应用市场',
				component: Loader(() => import('@/page/application/settings/releaseLogs/Index')),
				moduleKey: 'e81a0a80d07211e99ab500163e065e43'
			},
			{
				path: `${prev}/settings/pay_channels`,
				name: '支付通道',
				level: Enum.LEVEL_SERVICE,
				component: Loader(() => import('@/page/application/settings/payChannel/Index')),
				moduleKey: '7b0c14f573ee11e9b1a2000c29f135eb'
			},
			{
				path: `${prev}/settings/banks`,
				name: '银行管理',
				component: Loader(() => import('@/page/application/settings/banks/Index')),
				moduleKey: '0f630bac73f111e9b1a2000c29f135eb'
			},
			{
				path: `${prev}/settings/recharge`,
				name: '充值管理',
				component: Loader(() => import('@/page/application/settings/recharge/Index')),
				moduleKey: '12a90fa47e0a11e99531000c29f135eb'
			},
			{
				path: `${prev}/settings/global_params`,
				name: '参数配置',
				isEnd: true,
				component: Loader(() => import('@/page/application/settings/globalParams/Index')),
				moduleKey: '1450c95c73f111e9b1a2000c29f135eb'
			}
		]
	}
];

export default resultList

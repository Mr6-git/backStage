import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Card,
	Table,
	Radio,
	Button,
	Popover,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import LineChart from '@/component/echarts/LineChart';
import NoChartData from '@/component/NoChartData';
import XLSX from '@/component/XLSX';
import DataGlobalParams from '@/data/GlobalParams';
import DataAgencys from '@/data/Agencys';
import DataUser from '@/data/User';
import DataTeam from '@/data/Team';
import NetReport from '@/net/report';
import Enum from '@/enum';
import Edit from './Edit';
import Search from './Search';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const BreadcrumbItem = Breadcrumb.Item;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				showQuickJumper: true,
				total: 0,
				current: 1,
				pageSize: 10,
				showSizeChanger: true,
				onChange: (page, pageSize) => {
					this.state.pagination.current = page;
					this.getData();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
					this.getData();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: false,
			hasTrend: false,
			// coinRate: DataGlobalParams.getCoinRate(),
			data: [
				{
					_id: 'parent0',
					"servicer_id": "1134625846519140352",
					"period": 20191025,
					"month": 0,
					"create_time": 0,
					"statistics_time": 0,
					"register_num": 0,
					"recharge_num": 1,
					"bet_num": 1,
					"in_amount": 0,
					"out_amount": 0,
					"profit_loss_amount": 0,
					"marketing_cost": 0,
					"recharge_tax": 0,
					"cash_discount_amount": 0,
					"scheme_income": 0,
					"live_income": 0,
					"unopened_bet_amount": 0,
					"bet_amount": 170100,
					"prize_amount": 0,
					"red_rush_amount": 0,
					"blue_patch_amount": 0,
					"customer_balance": 9948274,
					"agency_income": 0,
					children: [],
				}
			],
			agencyTree: [],
			tabList: [
				{
					id: 0,
					key: 'register_num',
					name: '新增人数'
				}, {
					id: 1,
					key: 'recharge_num',
					name: '充值人数'
				}, {
					id: 2,
					key: 'bet_num',
					name: '投注人数'
				}
			],
			active: localStorage.getItem('agencyTabActive') ? Number(localStorage.getItem('agencyTabActive')) : 0,

			chartDate: [],
			chartMap: {},
			activeId: 0,

			group_type: 1,
			period: '',
			time_exp: '',
			agency_id: '',
		}
		this.tabMap = {
			0: {
				id: 0,
				key: 'register_num',
				name: '新增人数'
			},
			1: {
				id: 1,
				key: 'recharge_num',
				name: '充值人数'
			},
			2: {
				id: 2,
				key: 'bet_num',
				name: '投注人数'
			},
			3: {
				id: 3,
				key: 'in_amount',
				name: '入金额'
			},
			4: {
				id: 4,
				key: 'out_amount',
				name: '出金额'
			},
			5: {
				id: 5,
				key: 'profit_loss_amount',
				name: '投注盈亏'
			},
			6: {
				id: 6,
				key: 'marketing_cost',
				name: '营销成本'
			},
			7: {
				id: 7,
				key: 'recharge_tax',
				name: '充值手续费'
			},
			8: {
				id: 8,
				key: 'cash_discount_amount',
				name: '兑换补贴'
			},
			9: {
				id: 9,
				key: 'scheme_income',
				name: '方案收益'
			},
			10: {
				id: 10,
				key: 'live_income',
				name: '直播收益'
			},
			11: {
				id: 11,
				key: 'unopened_bet_amount',
				name: '投注额（未开奖）'
			},
			12: {
				id: 12,
				key: 'red_rush_amount',
				name: '红冲'
			},
			13: {
				id: 13,
				key: 'blue_patch_amount',
				name: '蓝补'
			},
			14: {
				id: 14,
				key: 'customer_balance',
				name: '客户权益余额'
			},
			15: {
				id: 15,
				key: 'agency_income',
				name: '机构收益'
			},
		}
		this.items = {
			xAxis: {
				data: ['20191014', '20191015', '20191016', '20191017', '20191018', '20191019', '20191020', '20191021', '20191022', '20191023', '20191024', '20191025'],
			},
			data: [
				{
					name: '新增人数',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 8.3, 9.2, 21.6, 20, 36.4, 18.4, 8.3, 10],
				}
			]
		}
	}

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		const time_exp = `${startDate.unix()},${endDate.unix()}`;

		const json = {
			period,
			time_exp,
			// agency_id: DataTeam.currentId
			agency_id: '',
			group_type: 1,
		}
		this.getAgencyTree();
		this.getTrend(json);
		this.getData(json);

		
		let _tabList = this.state.tabList;
		const _active = localStorage.getItem('agencyTabActive') ? Number(localStorage.getItem('agencyTabActive')) : 0;

		if (localStorage.getItem('agencyTabList')) {
			_tabList = JSON.parse(localStorage.getItem('agencyTabList')).tabList;
			this.state.tabList = _tabList;
		}

		this.setState({
			period,
			time_exp,
			_active,
			activeId: _tabList[_active].id,
		});
	}

	componentWillUnmount() {
		localStorage.removeItem('agencyEditTabs');
		localStorage.removeItem('agencyTabList');
		localStorage.removeItem('agencyTabActive');
	}

	getTrend(data) {
		const json = {
			group_type: data.group_type,
			agency_id: data.agency_id,
			period: data.period,
		}
		NetReport.getAgencyChart(json).then(res => {
			const { group_type } = this.state;
			const dateKey = 'period';
			const data = res.data;
			const chartDate = [], chartMap = {}, chart = [];
			chart[0] = [];
			chart[1] = [];
			chart[2] = [];
			chart[3] = [];
			chart[4] = [];
			chart[5] = [];
			chart[6] = [];
			chart[7] = [];
			chart[8] = [];
			chart[9] = [];
			chart[10] = [];
			chart[11] = [];
			chart[12] = [];
			chart[13] = [];
			chart[14] = [];
			chart[15] = [];
			data.map(item => {
				chartDate.push(utils.periodToDate(item[dateKey], 1)); // 日期 array

				chart[0].push(item.register_num);
				chart[1].push(item.recharge_num);
				chart[2].push(item.bet_num);
				chart[3].push(item.in_amount / 100);
				chart[4].push(item.out_amount / 100);
				chart[5].push(item.profit_loss_amount / 100);
				chart[6].push(item.marketing_cost / 100);
				chart[7].push(item.recharge_tax / 100);
				chart[8].push(item.cash_discount_amount / 100);
				chart[9].push(item.scheme_income / 100);
				chart[10].push(item.live_income / 100);
				chart[11].push(item.unopened_bet_amount / 100);
				chart[12].push(item.red_rush_amount / 100);
				chart[13].push(item.blue_patch_amount / 100);
				chart[14].push(item.customer_balance / 100);
				chart[15].push(item.agency_income / 100);
			})
			for (let i = 0; i < 16; i++) {
				chartMap[i] = chart[i];
			}
			this.setState({
				hasTrend: data && data.length ? true : false,
				chartDate,
				chartMap,
			});
			
		}).catch(e => {})
	}

	getData = (data) => {
		const { pagination, group_type, period, agency_id } = this.state;
		const agencyId = data ? data.agency_id : agency_id;
		const json = {
			group_type: data ? data.group_type : group_type,
			agency_id: agencyId,
			period: data ? data.period : period,
		}
		NetReport.getServicerTotal(json).then(res => {
			const data = res.data;
			const { agencyTree } = this.state;
			const isServicer = this.isAgency();
			const hasChild = !!(agencyTree[0].children && agencyTree[0].children.length && !agencyId && isServicer)
			data.map((item, index) => {
				item._id = `parent${index}`;
				if (hasChild) {
					item.children = [];
				}
				item.period = utils.periodToDate(item.period);
				item.in_amount = item.in_amount / 100;
				item.credit_amount = item.credit_amount / 100;
				item.gold_amount = item.gold_amount / 100;
				item.goods_amount = item.goods_amount / 100;
				item.out_amount = item.out_amount / 100;
				item.opened_bet_amount = item.opened_bet_amount / 100;
				item.prize_amount = item.prize_amount / 100;
				item.profit_loss_amount = item.profit_loss_amount / 100;
				item.red_receive_amount = item.red_receive_amount / 100;
				item.red_expire_amount = item.red_expire_amount / 100;
				item.marketing_cost = item.marketing_cost / 100;
				item.recharge_tax = item.recharge_tax / 100;
				item.cash_discount_amount = item.cash_discount_amount / 100;
				item.scheme_income = item.scheme_income / 100;
				item.live_income = item.live_income / 100;
				item.unopened_bet_amount = item.unopened_bet_amount / 100;
				item.red_rush_amount = item.red_rush_amount / 100;
				item.blue_patch_amount = item.blue_patch_amount / 100;
				item.customer_balance = item.customer_balance / 100;
				item.agency_income = item.agency_income / 100;
			});
			this.setState({
				data: data,
				loading: false
			});
		}).catch(e => {})
	}

	getDataSub = (data, callback) => {
		const { group_type, period, agency_id, agencyTree } = this.state;
		const json = {
			group_type: data.group_type ? data.group_type : group_type,
			agency_id: data.agency_id ? data.agency_id : agency_id,
			period: data.period ? data.period : period,
		}
		const key = 'period';
		NetReport.getAgencyTotal(json).then(res => {
			const data = res.data;
			data.map((item, index) => {
				item._id = `child${item[key]}${index}`;
				item.period = this.getName(item.servicer_id);
			});
			callback(data);
		}).catch(e => {})
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	edit = () => {
		const { tabList } = this.state;
		const data = [];
		tabList.map(item => {
			data.push(item.id);
		});
		const options = {
			title: <Fragment>
						编辑指标
						<Popover placement="rightTop" title="" content={this.renderPop()}>
							<Icon type="question-circle" style={{ marginLeft: '8px', color: '#1890ff' }} />
						</Popover>
					</Fragment>,
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Edit
						data={data}
						option={Object.values(this.tabMap)}
						onEdit={this.handleEdit}
					/>,
			props: options,
			parent: this
		});
	}

	handleEdit = (tabs) => {
		const tabList = [];
		const tabMap = this.tabMap;
		tabs.map(item => {
			tabList.push(tabMap[item]);
		});
		let { active, activeId } = this.state;
		const filterItem = tabList.filter(item => item.id == activeId);
		if (!filterItem || !filterItem.length) {
			active = 0;
			localStorage.setItem('agencyTabActive', active)
			activeId = tabList[0].id;
		}
		this.state.active = active;
		this.state.activeId = activeId;
		this.setState({
			tabList,
		});
		localStorage.setItem('agencyEditTabs', JSON.stringify({ tabs }));
		localStorage.setItem('agencyTabList', JSON.stringify({ tabList }));
	}

	handleSearch = (data) => {
		this.setState({
			group_type: data.group_type,
			period: data.period,
			time_exp: data.time_exp,
			agency_id: data.agency_id,
		});

		this.getTrend(data);
		this.getData(data);
	}

	handleRadio = (e) => {
		const id = e.target.value;
		const { tabList, active } = this.state;
		let index = 0;
		tabList.filter((item, i) => {
			if (item.id == id) {
				index = i;
			}
		});
		if (index == active) return;
		localStorage.setItem('agencyTabActive', index)
		this.setState({
			active: index,
			activeId: id,
		});
	}

	handleChart(state) {
		const { chartDate, chartMap, activeId } = state;
		const data = chartMap[activeId];
		let interval = 0;
		if (!data || !data.length) return;
		const len = data.length;
		if (len > 30) {
			interval = Math.floor((len - 30) / 20) + 1;
		}

		return {
			xAxis: {
				data: chartDate,
				axisLabel: {
					interval: interval,
					rotate: len > 12 ? 45 : 0
				}
			},
			data: [
				{
					name: this.tabMap[activeId].name,
					symbol: 'circle',
					showSymbol: data.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: data,
				}
			],
			type: 'line',
			smooth: true,
		}
	}

	onExpand = (expanded, record) => {
		if (!expanded) return;
		const { group_type, data, agencyTree } = this.state;
		const key = 'period';
		const period = record.period.replace(/-/g, '');
		this.getDataSub({ period }, (children) => {
			children.map(item => {
				item.in_amount = item.in_amount / 100;
				item.credit_amount = item.credit_amount / 100;
				item.gold_amount = item.gold_amount / 100;
				item.goods_amount = item.goods_amount / 100;
				item.out_amount = item.out_amount / 100;
				item.opened_bet_amount = item.opened_bet_amount / 100;
				item.prize_amount = item.prize_amount / 100;
				item.profit_loss_amount = item.profit_loss_amount / 100;
				item.red_receive_amount = item.red_receive_amount / 100;
				item.red_expire_amount = item.red_expire_amount / 100;
				item.marketing_cost = item.marketing_cost / 100;
				item.recharge_tax = item.recharge_tax / 100;
				item.cash_discount_amount = item.cash_discount_amount / 100;
				item.scheme_income = item.scheme_income / 100;
				item.live_income = item.live_income / 100;
				item.unopened_bet_amount = item.unopened_bet_amount / 100;
				item.red_rush_amount = item.red_rush_amount / 100;
				item.blue_patch_amount = item.blue_patch_amount / 100;
				item.customer_balance = item.customer_balance / 100;
				item.agency_income = item.agency_income / 100;
			})
			data.map(item => {
				if (item[key] != record[key]) return;
				if (children && children.length) {
					item.children = children;
				} else {
					delete item.children;
				}
			});
			this.setState({});
		})
	}

	isAgency() {
		let level = DataUser.source.team.level;
		if (DataAgencys.source.length && DataAgencys.map[DataTeam.currentId]) {
			level = DataAgencys.map[DataTeam.currentId].level;
		}
		switch (level) {
			case Enum.LEVEL_SERVICE: return true;
			case Enum.LEVEL_AGENCY: return false;
			default: return false;
		}
	}

	getName(id) {
		const { agencyTree } = this.state;
		if (agencyTree[0]._id == id) {
			return '本机构';
		}
		const choosed = agencyTree[0].children.filter(item => item._id == id)
		if (choosed && choosed.length) {
			return choosed[0].alias;
		}
		return '-'
	}

	getColumns(state) {
		const { group_type } = state;
		const date = 'period';
		return [
			{
				title: '日期',
				dataIndex: date,
				key: date,
				fixed: 'left',
				width: 200,
			}, {
				title: '新增人数',
				dataIndex: 'register_num',
				key: 'register_num',
				align: 'right',
				width: 100,
			}, {
				title: '充值人数',
				dataIndex: 'recharge_num',
				key: 'recharge_num',
				align: 'right',
				width: 100,
			}, {
				title: '投注人数',
				dataIndex: 'bet_num',
				key: 'bet_num',
				align: 'right',
				width: 100,
			}, {
				title: '入金额',
				dataIndex: 'in_amount',
				key: 'in_amount',
				align: 'right',
				width: 140,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '出金额',
				key: 'out_amount',
				align: 'right',
				width: 140,
				render: data => {
					const content = (
						<Fragment>
							<p>
								信用卡还款：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.credit_amount, 2)}
								</span>
							</p>
							<p>
								黄金兑换：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.gold_amount, 2)}
								</span>
							</p>
							<p>
								商城商品：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.goods_amount, 2)}
								</span>
							</p>
						</Fragment>
					)
					return <Popover
								placement='right'
								content={content}
								title='出金额明细'
							>
								<a href="javascript:;">{utils.formatMoney(data.out_amount, 2)}</a>
							</Popover>
				}
			}, {
				title: '投注盈亏',
				key: 'profit_loss_amount',
				align: 'right',
				width: 140,
				render: data => {
					const content = (
						<Fragment>
							<p>
								投注额（已开奖）：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.opened_bet_amount, 2)}
								</span>
							</p>
							<p>
								派奖额：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.prize_amount, 2)}
								</span>
							</p>
						</Fragment>
					)
					return <Popover
								placement='right'
								content={content}
								title='投注盈亏明细'
							>
								<a href="javascript:;">{utils.formatMoney(data.profit_loss_amount, 2)}</a>
							</Popover>
				}
			}, {
				title: '营销成本',
				key: 'marketing_cost',
				align: 'right',
				width: 130,
				render: data => {
					const content = (
						<Fragment>
							<p>
								领取红包：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.red_receive_amount, 2)}
								</span>
							</p>
							<p>
								回收红包：
								<span className={globalStyles.color999}>
									{utils.formatMoney(data.red_expire_amount, 2)}
								</span>
							</p>
						</Fragment>
					)
					return <Popover
								placement='right'
								content={content}
								title='营销成本明细'
							>
								<a href="javascript:;">{utils.formatMoney(data.marketing_cost, 2)}</a>
							</Popover>
				}
			}, {
				title: '充值手续费',
				dataIndex: 'recharge_tax',
				key: 'recharge_tax',
				align: 'right',
				width: 120,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '兑换补贴',
				dataIndex: 'cash_discount_amount',
				key: 'cash_discount_amount',
				align: 'right',
				width: 120,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '方案收益',
				dataIndex: 'scheme_income',
				key: 'scheme_income',
				align: 'right',
				width: 100,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '直播收益',
				dataIndex: 'live_income',
				key: 'live_income',
				align: 'right',
				width: 100,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '投注额(未开奖)',
				dataIndex: 'unopened_bet_amount',
				key: 'unopened_bet_amount',
				align: 'right',
				width: 150,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '红冲',
				dataIndex: 'red_rush_amount',
				key: 'red_rush_amount',
				align: 'right',
				width: 100,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '蓝补',
				dataIndex: 'blue_patch_amount',
				key: 'blue_patch_amount',
				align: 'right',
				width: 100,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '客户权益余额',
				dataIndex: 'customer_balance',
				key: 'customer_balance',
				align: 'right',
				width: 150,
				render: data => <Fragment>{utils.formatMoney(data, 2)}</Fragment>
			}, {
				title: '机构收益',
				dataIndex: 'agency_income',
				key: 'agency_income',
				align: 'right',
				width: 140,
				render: data => <a className={data > 0 ? styles.green : styles.orange}>{utils.formatMoney(data, 2)}</a>
			}
		];
	}

	renderPop() {
		return <div className={styles.agencyPop}>
					<p><a>新增人数：</a>查询条件下，注册成功的用户数量</p>
					<p><a>充值人数：</a>查询条件下，充值的用户数量</p>
					<p><a>投注人数：</a>查询条件下，参与竞猜的用户数量</p>
					<p><a>入金额：</a>查询条件下，充值的金额总和</p>
					<p><a>出金额：</a>黄金兑换金额+信用卡还款金额+商城订单金额</p>
					<p><a>投注盈亏：</a>投注额（已开奖）-派奖额（赛前和滚盘）</p>
					<p><a>营销成本：</a>领取红包-回收红包</p>
					<p><a>派奖额：</a>用户赢得竞猜后，平台返奖额总和（赛前和滚盘）</p>
					<p><a>方案收益：</a>购买方案的金额-方案未中退款金额</p>
					<p><a>兑换补贴：</a>已审核订单优惠金额总和-已退款订单的优惠金额总和</p>
					<p><a>充值手续费：</a>用户充值金额的1%</p>
					<p><a>直播收益：</a>用户购买直播道具的金额总和</p>
					<p><a>投注额（未开奖）：</a>未开奖的赛事中，用户的投注额总和</p>
					<p><a>红冲：</a>减少用户账户资金</p>
					<p><a>蓝补：</a>增加用户账户资金</p>
					<p><a>客户权益余额：</a>机构下属用户的资金余额总和</p>
					<p><a>机构受益：</a>投注收益-营销成本+方案收益+直播收益-充值手续费-兑换补贴</p>
				</div>
	}



	render() {
		const state = this.state;
		const {
			data,
			pagination,
			loading,
			agencyTree,
			hasTrend,
			tabList,
			active,
			activeId,
		} = state;
		const columns = this.getColumns(state);
		const _items = hasTrend ? this.handleChart(state) : this.items;
		const isServicer = this.isAgency();
		return <Fragment>
					<div className={globalStyles.topWhiteBlock} style={{border: '0'}}>
						<Breadcrumb>
							<BreadcrumbItem>首页</BreadcrumbItem>
							<BreadcrumbItem>数据统计</BreadcrumbItem>
						</Breadcrumb>
						<h3 className={globalStyles.pageTitle}>{isServicer ? '代理商' : '分销商'}报表</h3>
					</div>
					<div className={globalStyles.content}>
						<Search agencyTree={agencyTree} handleSearch={this.handleSearch} isServicer={isServicer} />
						<Card bordered={false} className={globalStyles.mBottom16}>
							<Row gutter={20} className={globalStyles.mBottom12}>
								<Col span={20}>
									<RadioGroup
										value={Number(activeId)}
										onChange={this.handleRadio}
									>
										{tabList.map((item, index) => (
											<RadioButton
												value={item.id}
												key={index}
											>{item.name}</RadioButton>
										))}
									</RadioGroup>
								</Col>
								<Col span={4} style={{ textAlign: 'right' }}>
									<Button onClick={this.edit}>编辑指标</Button>
								</Col>
							</Row>
							<LineChart {..._items} style={{ height: '350px' }} />
							{!hasTrend ? <NoChartData style={{ paddingTop: '140px' }} /> : null}
						</Card>
						<Card bordered={false}>
							<Row gutter={20} className={globalStyles.mBottom8}>
								<Col span={12}>
									<h3>
										数据明细
										<Popover placement="rightBottom" title="" content={this.renderPop()}>
											<Icon type="question-circle" style={{ marginLeft: '8px', color: '#1890ff' }} />
										</Popover>
									</h3>
								</Col>
								<Col span={12} style={{ textAlign: 'right' }}>
									<Button disabled={!!0} onClick={() => {
										XLSX.exportExcel(columns, data)
									}}>导出Excel</Button>
								</Col>
							</Row>
							<Table
								dataSource={data}
								columns={columns}
								rowKey={record => record._id}
								loading={loading}
								animated={false}
								onExpand={this.onExpand}
								pagination={false}
								indentSize={5}
								scroll={{ x: 2130 }}
							/>
						</Card>
					</div>
				</Fragment>
	}
}

import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	Table,
	Button,
	Divider,
	message,
	Statistic,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import BarChart from '@/component/echarts/BarChart';
import PieChart from '@/component/echarts/PieChart';
import NoChartData from '@/component/NoChartData';
import GDPList from '@/component/GDPList';
import Search from './Search';
import NetReport from '@/net/report';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			period: '',
			capitalOverview: {
				"recharge": 0,
				"bet": 0,
				"expense": 0,
				"average": 0
			},
			capitalFlowTrend: [],
			expenseTrend: [],
			betGame: [],
			gameCount: 0,
			channelExpense: [],
			channelCount: 0,
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true,
			timeType: 1
		}
		this.columns = [
			{
				title: '日期',
				dataIndex: 'date',
			}, {
				title: '信用卡还款',
				dataIndex: 'credits',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data / 100)
			}, {
				title: '黄金兑换',
				dataIndex: 'golds',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data / 100)
			}, {
				title: '锦鲤商城',
				dataIndex: 'mall',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data / 100)
			}, {
				title: '话费充值',
				key: 'call_charge',
				align: 'right',
				width: 150,
				render: (data) => 0
			}, {
				title: '生活缴费',
				key: 'life_fee',
				align: 'right',
				width: 150,
				render: (data) => 0
			}, {
				title: '其他',
				key: 'other',
				align: 'right',
				width: 150,
				render: (data) => 0
			}
		];
		this.format = ['YYYY-MM-DD', 'YYYY-MM-DD', 'YYYY-MM', 'MM-DD HH'];
	}

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		const time_exp = `${startDate.unix()},${endDate.unix()}`;

		this.setState({ period });
		const json = { period, time_type: 1 }
		this.getCapitalFlowOverview(json);
		this.getCapitalFlowTrend(json);
		this.getExpenseByChannel(json);
		this.getExpenseTrend(json);
	}

	getCapitalFlowOverview = (data) => {
		const json = { ...data };
		NetReport.getCapitalFlowOverview(json).then(res => {
			this.setState({
				capitalOverview: res.data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getCapitalFlowTrend = (data) => {
		const json = { ...data };
		NetReport.getCapitalFlowTrend(json).then(res => {
			this.setState({
				capitalFlowTrend: res.data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getBetGame = (data) => {
		const json = { ...data };
		NetReport.getBetGame(json).then(res => {
			const data = res.data;
			const betGame = [
				{name: '信用卡还款', value: data.credits.amount / 100, icon: 'circle', ratio: (data.credits.ratio / 100) + '%'},
				{name: '黄金兑换', value: data.golds.amount / 100, icon: 'circle', ratio: (data.golds.ratio / 100) + '%'},
				{name: '锦鲤商城', value: data.mall.amount / 100, icon: 'circle', ratio: (data.mall.ratio / 100) + '%'}
			];
			this.setState({
				betGame
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getExpenseByChannel = (data) => {
		const json = { ...data };
		NetReport.getExpenseByChannel(json).then(res => {
			let channelCount = 0;
			const channelExpense = [];
			res.data.map(item => {
				channelExpense.push({name: item.name, value: item.amount / 100, icon: 'circle', ratio: (item.ratio / 100) + '%'});
				if (item.amount != 0) {
					channelCount++;
				}
			});
			this.setState({
				channelExpense,
				channelCount
			});
			channelExpense = null;
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getExpenseTrend = (data) => {

		const json = {
			...data,
		};

		NetReport.getExpenseTrend(json).then(res => {
			const rows = res.data.rows || res.data;
			this.setState({
				loading: false,
				expenseTrend: rows
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	handleSearch = (data) => {
		this.setState({
			period: data.period,
			timeType: data.time_type,
		});
		this.getCapitalFlowOverview(data);
		this.getCapitalFlowTrend(data);
		this.getExpenseByChannel(data);
		this.getExpenseTrend(data);
	}

	handleTableChange = (pagination, filters, sorter) => {
		const state = this.state;
		const pager = { ...state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			loading: true,
		}, () => {
			this.getExpenseTrend(state.period)
		});
	}

	render() {
		const state = this.state;
		const { timeType, gameCount, channelExpense, channelCount, capitalOverview, capitalFlowTrend } = state;
		let { betGame } = state;

		const recharge = capitalOverview.recharge / 100;
		const bet = capitalOverview.bet / 100;
		const expense = capitalOverview.expense / 100;
		const average = capitalOverview.average / 100;

		let dateList = [];
		let inflowData = [];
		let outflowData = [];
		let differData = [];

		capitalFlowTrend.map(item => {
			dateList.push(item.date);
			inflowData.push(item.inflows / 100);
			outflowData.push(item.expense / 100 * -1);
			differData.push((item.inflows - item.expense) / 100);
		});

		if (capitalFlowTrend.length == 0) {
			dateList = ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '10-27', '10-28', '10-29', '10-30', '10-31'];
			inflowData = [67720, 118540, 260559.4, 562500, 307510, 224230, 108870, 459850.1, 462170, 556940, 299940, 246220, 163660, 106410, 213370, 338840, 269260, 490540, 309530, 157230, 59060, 178460, 191500, 217280, 230370, 234890, 77860, 30340, 137230, 200460, 186060];
			outflowData = [-169761.6, -196928.84, -39953.15, -143341.35, -174986.76, -44664.3, -52754.48, -107479.71, -66580.03, -36239.28, -27707.41, -64257.17, -68388.17, -31002.23, -36409.85, -53636.98, -86582.86, -39166.94, -66966.36, -32640.85, -18494.28, -24735.55, -29111.5, -57576.83, -72099.28, -57219.13, -36393.98, -19148.33, -28840.27, -27386.23, -43631.32];
			differData = [-102041.6, -78388.84, 220606.25, 419158.65, 132523.24, 179565.7, 56115.52, 352370.39, 395589.97, 520700.72, 272232.59, 181962.83, 95271.83, 75407.77, 176960.15, 285203.02, 182677.14, 451373.06, 242563.64, 124589.15, 40565.72, 153724.45, 162388.5, 159703.17, 158270.72, 177670.87, 41466.02, 11191.67, 108389.73, 173073.77, 142428.68];
		}

		if (gameCount == 0) {
			betGame = [
				{name: '英雄联盟', value: 0, icon: 'circle', ratio: '0%'},
				{name: '王者荣耀', value: 0, icon: 'circle', ratio: '0%'},
				{name: '刀塔2', value: 0, icon: 'circle', ratio: '0%'},
				{name: '守望先锋', value: 0, icon: 'circle', ratio: '0%'},
				{name: '反恐精英', value: 0, icon: 'circle', ratio: '0%'},
				{name: '星际争霸2', value: 0, icon: 'circle', ratio: '0%'}
			];
		}

		let barWidth = 25;
		if (dateList.length > 12) {
			barWidth -= dateList.length - 12;
			if (barWidth < 5) barWidth = 5;
		}

		let interval = 0;
		const len = dateList.length;
		if (len > 30) {
			interval = Math.floor((len - 30) / 20) + 1;
		}


		const items = {
			xAxis: {
				data: dateList,
				axisLabel: {
					interval: interval,
					rotate: len > 12 ? 45 : 0
				}
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: function (params) {
					let tooltip = params[0].name;
					params.map(item => {
						tooltip += '<br/>' + item.seriesName + ': ' + utils.formatMoney(Math.abs(item.value));
					});
					return tooltip;
				}
			},
			data: [
				{
					name:'流入',
					type:'bar',
					barWidth: barWidth,
					color: '#009900',
					stack: '1',
					data: inflowData
				},
				{
					name:'流出',
					type:'bar',
					barWidth: barWidth,
					color: '#FF6600',
					stack: '1',
					data: outflowData
				},
				{
					name:'流向',
					type:'line',
					barWidth: 1,
					color: '#999999',
					yAxisIndex: 0,
					data: differData
				}
			]
		}

		const gameHeader = [
			{title: '游戏类型', width: 8 },
			{title: '投注总额', width: 8 },
			{title: '占比', width: 8 }
		];

		const channelHeader = [
			{title: '渠道', width: 8 },
			{title: '出金总额', width: 8 },
			{title: '占比', width: 8 }
		];

		return <div className={globalStyles.content}>
					<Search handleSearch={this.handleSearch} />
					<Card className={classnames(globalStyles.mBottom16, globalStyles.statistic)} bordered={false}>
						<h3>资金流向指标</h3>
						<Row gutter={16} className={classnames(globalStyles.mTop24, globalStyles.mBottom8)}>
							<Col span={6}><Statistic value={recharge / 10000} title="充值总额" precision={2} suffix="万" /></Col>
							<Col span={6}><Statistic value={bet / 10000} title="投注总额" precision={2} suffix="万" /></Col>
							<Col span={6}><Statistic value={expense / 10000} title="出金总额" precision={2} suffix="万" /></Col>
							<Col span={6}><Statistic value={average} title="平均投注额" precision={2} /></Col>
						</Row>
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>资金流入流出分布</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}><Button disabled={true}>导出Excel</Button></Col>
						</Row>
						<BarChart {...items} style={{ height: '350px' }} />
						{(capitalFlowTrend.length == 0) ? (<NoChartData style={{ paddingTop: '140px' }} />) : null}
					</Card>
					<Card bordered={false} className={classnames(globalStyles.mBottom16, styles.spread)} style={{ display: 'none' }}>
						<h3>游戏分布</h3>
						<Row>
							<Col span={14}><PieChart title="游戏分布" data={betGame} style={{ height: 240 }} /></Col>
							<Col span={1}><Divider type="vertical" style={{ height: '230px' }} /></Col>
							<Col span={9}><GDPList data={betGame} header={gameHeader} /></Col>
						</Row>
						{(gameCount == 0) ? (<NoChartData style={{ paddingTop: '80px' }} />) : null}
					</Card>
					<Card bordered={false} className={classnames(globalStyles.mBottom16, styles.spread)}>
						<h3>流出渠道分布</h3>
						<Row>
							<Col span={14}><PieChart title="出金渠道分布" data={channelExpense} style={{ height: 240 }} /></Col>
							<Col span={1}><Divider type="vertical" style={{ height: '230px' }} /></Col>
							<Col span={9}><GDPList data={channelExpense} header={channelHeader} /></Col>
						</Row>
						{(channelCount == 0) ? (<NoChartData style={{ paddingTop: '80px' }} />) : null}
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<h3>流出数据明细</h3>
						<Table
							dataSource={state.expenseTrend.filter(item => item.credits > 0 || item.golds > 0 || item.mall > 0 || item.call_charge > 0 || item.life_fee > 0 || item.other > 0)}
							columns={this.columns}
							rowKey={record => record.date}
							loading={state.loading}
							animated={false}
							pagination={false}
							scroll={{ x: 1000 }}
						/>
					</Card>
				</div>
	}
}

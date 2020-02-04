import React, { Component } from 'react';
import {
	Row,
	Col,
	Tabs,
	Card,
	Icon,
	Alert,
	Table,
	Button,
	message,
	Statistic,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import NetReport from '@/net/report';
import LineChart from '@/component/echarts/LineChart';
import NoChartData from '@/component/NoChartData';
import ChainRatio from '@/component/ChainRatio';
import Search from './Search';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentTab: '0',
			customerTrend: [],
			dateData: [],
			registerData: [],
			rechargeData: [],
			betData: [],
			totalRegisterData: [],
			customerOverview: {
				"register": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"recharge": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"bet": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"expense": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"total_register": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				}
			},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true
		}
		this.items = {
			xAxis: {
				data: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'],
			},
			data: [
				{
					name: '新注册人数',
					smooth: true,
					symbol: 'none',
					type: 'line',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 281.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}
			]
		},
		this.columns = [
			{
				title: '日期',
				dataIndex: 'date',
				width: 250,
			}, {
				title: '新注册人数',
				dataIndex: 'register',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data, 0)
			}, {
				title: '充值人数',
				dataIndex: 'recharge',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data, 0)
			}, {
				title: '投注人数',
				dataIndex: 'bet',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data, 0)
			}, {
				title: '兑现人数',
				dataIndex: 'expense',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data, 0)
			}, {
				title: '累积人数',
				dataIndex: 'total_register',
				align: 'right',
				width: 150,
				render: (data) => utils.formatMoney(data, 0)
			}
		];
	}

	componentWillMount() {
		this.getCustomerOverview();
		this.getExpenseTrendList();
	}

	getCustomerOverview = () => {
		NetReport.getCustomerOverview().then(res => {
			this.setState({
				customerOverview: res.data
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

	getExpenseTrendList = () => {
		const dateData = [];
		const registerData = [];
		const rechargeData = [];
		const betData = [];
		const totalRegister = [];
		const state = this.state;

		const data = {
			period: `${moment().startOf('month').format('YYYYMMDD')},${moment().endOf('month').format('YYYYMMDD')}`,
			time_type: 1,
			...state.filterInfo,
		};

		NetReport.getExpenseTrendList(data).then(res => {
			const rows = res.data.rows || res.data;
			rows.map(item => {
				dateData.push(item.date);
				registerData.push(Math.floor(item.register));
				rechargeData.push(Math.floor(item.recharge));
				betData.push(Math.floor(item.bet));
				totalRegister.push(Math.floor(item.total_register));
			});

			this.setState({
				loading: false,
				customerTrend: rows,
				dateData, 
				registerData, 
				rechargeData, 
				betData, 
				totalRegister
			});
			
			dateData = null;
			registerData = null;
			rechargeData = null;
			betData = null;
			totalRegister = null;
			
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		pager.pageSize = pagination.pageSize;

		this.setState({
			pagination: pager,
			loading: true,
		}, () => {
			this.getExpenseTrendList();
		});
	}

	handleSearch = (data) => {
		this.setState({
			filterInfo: data,
		}, () => {
			this.getExpenseTrendList();
		});
	}

	render() {
		const state = this.state;
		const {
			customerOverview, 
			customerTrend, 
			loading, 
			pagination,
		} = state;

		let {
			dateData,
			registerData,
			rechargeData,
			betData,
			totalRegisterData
		} = state;

		if (customerTrend.length == 0) {
			dateData = ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12'];
			registerData = [862, 1018, 964, 1026, 1679, 1600, 1570, 154, 190, 330, 410];
			rechargeData = [230, 210, 220, 182, 191, 234, 290, 330, 310, 150, 232, 201];
			betData = [191, 234, 290, 330, 310, 150, 232, 201, 320, 332, 301, 334];
			totalRegisterData = [320, 332, 301, 334, 390, 330, 320, 120, 132, 101, 134, 90];
		}

		const columns = this.columns;
		const items = this.items;

		const register = customerOverview.register;
		const recharge = customerOverview.recharge;
		const bet = customerOverview.bet;
		const expense = customerOverview.expense;
		const totalRegister = customerOverview.total_register;

		return <div className={globalStyles.content}>
					<Card className={classnames(globalStyles.mBottom16, globalStyles.statistic)} bordered={false}>
						<Row gutter={16} className={classnames(globalStyles.mTop16, globalStyles.mBottom24)}>
							<Col span={5}>
								<Statistic value={register.amount} title="新注册人数" />
								<ChainRatio data={register} ratio={100} />
							</Col>
							<Col span={5}>
								<Statistic value={recharge.amount} title="充值人数" />
								<ChainRatio data={recharge} ratio={100} />
							</Col>
							<Col span={5}>
								<Statistic value={bet.amount} title="投注人数" />
								<ChainRatio data={bet} ratio={100} />
							</Col>
							<Col span={5}>
								<Statistic value={expense.amount} title="兑现人数" />
								<ChainRatio data={expense} ratio={100} />
							</Col>
							<Col span={4}>
								<Statistic value={totalRegister.amount} title="累积注册人数" />
								<ChainRatio data={totalRegister} ratio={100} />
							</Col>
						</Row>
						<Alert message="本页根据昨日数据来计算，由于服务器缓存，以及指标计算方法和统计时间的差异，数据可能出现微小误差，一般在1%以内。" type="info" showIcon />
					</Card>
					<Search handleSearch={this.handleSearch} />
					<Card 
						bordered={false} 
						className={globalStyles.mBottom16}
						bodyStyle={{ position: 'relative' }}
						style={{ display: 'none' }}
					>
						<div style={{ position: 'absolute', top: '20px', right: '25px', }}>
							<Button disabled={true}>导出Excel</Button>
						</div>
						<Tabs
							tabBarStyle={{margin: 0}}
							animated={{inkBar: true, tabPane: false}}
							activeKey={this.state.currentTab}
						>
							<TabPane tab="新注册人数" key="0">
								<LineChart {...items} style={{ height: '350px' }} />
								<NoChartData style={{ paddingTop: '140px' }} />
							</TabPane>
							<TabPane tab="充值人数" key="1">
								<LineChart {...items} style={{ height: '350px' }} />
								<NoChartData style={{ paddingTop: '140px' }} />
							</TabPane>
							<TabPane tab="投注人数" key="2">
								<LineChart {...items} style={{ height: '350px' }} />
								<NoChartData style={{ paddingTop: '140px' }} />
							</TabPane>
							<TabPane tab="兑现人数" key="3">
								<LineChart {...items} style={{ height: '350px' }} />
								<NoChartData style={{ paddingTop: '140px' }} />
							</TabPane>
							<TabPane tab="累积人数" key="4">
								<LineChart {...items} style={{ height: '350px' }} />
								<NoChartData style={{ paddingTop: '140px' }} />
							</TabPane>
						</Tabs>
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>数据明细</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}><Button disabled={true}>导出Excel</Button></Col>
						</Row>
						<Table
							dataSource={customerTrend.filter(item => item.register > 0 || item.recharge > 0 || item.bet > 0 || item.expense > 0 || item.total_register > 0)}
							columns={columns}
							rowKey={record => record.date}
							loading={loading}
							animated={false}
							pagination={false}
							scroll={{ x: 1050 }}
						/>
					</Card>
				</div>
	}
}

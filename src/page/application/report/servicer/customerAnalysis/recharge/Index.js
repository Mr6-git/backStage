import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	Button,
	message,
	Statistic,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import NetReport from '@/net/report';
import Search from './Search';
import LineChart from '@/component/echarts/LineChart';
import NoChartData from '@/component/NoChartData';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			quota: {
				"amount": 0,
				"total": 0,
				"recharge": 0,
				"arpu": 0
			},
			yesterday: {
				"amount": 0,
				"total": 0,
				"recharge": 0,
				"arpu": 0
			},
			rechargeTrend: [],
			capitalTrend: [],
			customerDate: [], 
			registerUser: [], 
			rechargeUser: [],
			capitalDate: [],
			rechargeData: [],
			withdrawData: [],
			bettingData: [],
			awardData: [],
			loading: true
		}
	}

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;

		const json = { period, time_type: 1 }

		this.getCustomerRechargeMonth(json);
		this.getCustomerRechargeDay(json);

		this.getCustomerRechargeTrend(json);
		this.getCustomerCapitalTrend(json);
	}

	getCustomerRechargeMonth = (json) => {
		NetReport.getCustomerRechargeMonth(json).then(res => {
			this.setState({
				loading: false,
				quota: res.data,
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

	getCustomerRechargeDay = (json) => {
		NetReport.getCustomerRechargeDay(json).then(res => {
			this.setState({
				loading: false,
				yesterday: res.data,
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

	getCustomerRechargeTrend = (json) => {
		const customerDate = [];
		const registerUser = [];
		const rechargeUser = [];

		NetReport.getCustomerRechargeTrend(json).then(res => {
			res.data.map(item => {
				customerDate.push(item.date);
				registerUser.push(item.register);
				rechargeUser.push(item.recharge);
			});

			this.setState({
				loading: false,
				rechargeTrend: res.data,
				customerDate: customerDate,
				registerUser: registerUser,
				rechargeUser: rechargeUser
			});

			customerDate = null;
			registerUser = null;
			rechargeUser = null;

		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				loading: false,
			});
		});
	}

	getCustomerCapitalTrend = (json) => {
		const capitalDate = [];
		const rechargeData = [];
		const withdrawData = [];
		const bettingData = [];
		const awardData = [];

		NetReport.getCustomerCapitalTrend(json).then(res => {
			res.data.map(item => {
				capitalDate.push(item.date);
				rechargeData.push(item.recharge / 100);
				withdrawData.push(item.expense / 100);
				bettingData.push(item.bet / 100);
				awardData.push(item.bet_settles / 100);
			});

			this.setState({
				loading: false,
				capitalTrend: res.data,
				capitalDate: capitalDate,
				rechargeData: rechargeData,
				withdrawData: withdrawData,
				bettingData: bettingData,
				awardData: awardData
			});

			capitalDate = null;
			rechargeData = null;
			withdrawData = null;
			bettingData = null;
			awardData = null;

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
		this.getCustomerRechargeTrend(data);
		this.getCustomerCapitalTrend(data);
		this.getCustomerRechargeMonth(data);
		this.getCustomerRechargeDay(data);
	}

	render() {
		const state = this.state;
		const {
			quota, 
			yesterday, 
			rechargeTrend, 
			capitalTrend
		} = state;
		let {
			customerDate,
			registerUser,
			rechargeUser,
			capitalDate,
			rechargeData,
			withdrawData,
			bettingData,
			awardData
		} = state;

		if (rechargeTrend.length == 0) {
			customerDate = ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '10-27', '10-28', '10-29', '10-30', '10-31'];
			registerUser = [1313, 196, 396, 159, 227, 179, 538, 76, 65, 43, 4, 12, 24, 54, 47, 58, 87, 13, 31, 211, 370, 1119, 654, 79, 7, 18, 45, 55, 25, 40, 23];
			rechargeUser = [153, 160, 135, 70, 82, 180, 183, 156, 184, 162, 61, 123, 183, 219, 173, 196, 133, 72, 107, 167, 177, 233, 223, 208, 60, 59, 147, 181, 119, 93, 44];
		}

		if (capitalTrend.length == 0) {
			capitalDate = ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '10-27', '10-28', '10-29', '10-30', '10-31'];
			rechargeData = [186060, 200460, 137230, 30340, 77860, 234890, 230370, 217280, 191500, 178460, 59060, 157230, 309530, 490540, 269260, 338840, 213370, 106410, 163660, 246220, 299940, 556940, 462170, 459850.1, 108870, 224230, 307510, 562500, 260559.4, 118540, 67720];
			withdrawData = [47551.92, 31428.98, 30240.37, 23458.22, 44837.01, 78265.25, 86720.23, 79647.98, 32201.5, 46777.43, 21890.65, 35917.75, 70274.6, 86898.96, 100667.18, 69567.63, 61300.6, 35752.3, 68388.17, 66383.87, 46395.96, 41606.28, 111003.25, 170872.91, 52754.48, 44664.3, 216717.25, 223638.04, 63938.35, 244008.47, 319092.72];
			bettingData = [1675842, 2232247, 2150424, 918876, 1648948, 2558907, 2366481, 2100504, 2276141, 2101614, 952028, 1844115, 3125478, 3979581, 3499179, 2469167, 2851338, 2025205, 2282667, 3928843, 3725300, 2827668, 3188613, 4197664, 2983005, 4035462, 5304311, 5148881, 2734820, 2586446, 659173];
			awardData = [1748053.58, 1940821, 1948989.56, 749430.54, 1439343.83, 2180095.68, 2504598.1, 1635560.73, 2263080.73, 958521.11, 1092751.58, 1421349.8, 2535129.43, 2534756.99, 3217215.85, 2435526.18, 1807261.76, 1935474.45, 2150843.61, 3958569.66, 3355820.46, 1798440.28, 2144460.92, 2273564.6, 2008693.75, 4041280.2, 5923052.67, 5453277.53, 2089493.12, 2242515.07, 619371.56];
		}

		let intervalCum = 0;
		const lenCum = customerDate.length;
		if (lenCum > 30) {
			intervalCum = Math.floor((lenCum - 30) / 20) + 1;
		}

		const customerData = {
			xAxis: {
				data: customerDate,
				axisLabel: {
					interval: intervalCum,
					rotate: lenCum > 12 ? 45 : 0
				}
			},
			data: [
				{
					name: '新注册用户数',
					smooth: true,
					symbol: 'none',
					type: 'line',
					lineStyle: {
						width: 2
					},
					data: registerUser
				}, {
					name: '充值用户数',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: rechargeUser
				}
			]
		};

		let intervalCap = 0;
		const lenCap = capitalDate.length;
		if (lenCap > 30) {
			intervalCap = Math.floor((lenCap - 30) / 20) + 1;
		}

		const capitalData = {
			xAxis: {
				data: capitalDate,
				axisLabel: {
					interval: intervalCap,
					rotate: lenCap > 12 ? 45 : 0
				}
			},
			data: [
				{
					name: '充值金额',
					smooth: true,
					symbol: 'none',
					type: 'line',
					lineStyle: {
						width: 2
					},
					data: rechargeData
				}, {
					name: '提现额',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: withdrawData
				}, {
					name: '投注额',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: bettingData
				}, {
					name: '派奖额',
					smooth: true,
					symbol: 'none',
					type: 'line',
					lineStyle: {
						width: 2
					},
					data: awardData
				}
			]
		};

		return <div className={globalStyles.content}>
					<Card className={classnames(globalStyles.mBottom16, globalStyles.statistic)} bordered={false}>
						<h3>昨日充值用户统计</h3>
						<Row gutter={16} className={classnames(globalStyles.mTop24, globalStyles.mBottom8)}>
							<Col span={6}><Statistic value={yesterday.amount / 100} title="充值金额" precision={2} /></Col>
							<Col span={6}><Statistic value={yesterday.recharge ? yesterday.recharge : 0} title="充值用户数" /></Col>
							<Col span={6}><Statistic value={yesterday.arpu / 100} title="ARPU" precision={2} /></Col>
							<Col span={6}><Statistic value={yesterday.total} title="累积充值用户数" /></Col>
						</Row>
					</Card>
					<Search handleSearch={this.handleSearch} />
					<Card className={classnames(globalStyles.mBottom16, globalStyles.statistic)} bordered={false}>
						<h3>充值用户指标</h3>
						<Row gutter={16} className={classnames(globalStyles.mTop24, globalStyles.mBottom8)}>
							<Col span={6}><Statistic value={quota.amount / 100} title="充值金额" /></Col>
							<Col span={6}><Statistic value={quota.recharge ? quota.recharge : 0} title="充值用户数" /></Col>
							<Col span={6}><Statistic value={quota.arpu / 100} title="ARPU" precision={2} /></Col>
							<Col span={6}><Statistic value={quota.total} title="累积充值用户数" /></Col>
						</Row>
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>充值用户数变化</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}>
								<Button disabled={true}>导出Excel</Button>
							</Col>
						</Row>
						<LineChart {...customerData} style={{ height: '350px' }} />
						{(rechargeTrend.length == 0) ? (<NoChartData style={{ paddingTop: '140px' }} />) : null}
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>充值用户资金变化</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}><Button disabled={true}>导出Excel</Button></Col>
						</Row>
						<LineChart {...capitalData} style={{ height: '350px' }} />
						{(capitalTrend.length == 0) ? (<NoChartData style={{ paddingTop: '140px' }} />) : null}
					</Card>
				</div>
	}
}

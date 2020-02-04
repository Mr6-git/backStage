import React, { Component } from 'react';
import {
	Row,
	Col,
	Card,
	Table,
	Alert,
	Button,
	message,
	Statistic,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import Search from './Search';
import NetReport from '@/net/report';
import BarChart from '@/component/echarts/BarChart';
import NoChartData from '@/component/NoChartData';
import ChainRatio from '@/component/ChainRatio';
import globalStyles from '@/resource/css/global.module.less';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			capitalTrend: [],
			dateData: [],
			virtualData: [],
			bountyData: [],
			redEnvelopData: [],
			capitalOverview: {
				"capital": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"virtual": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"bounty": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				"red_envelop": {
					"amount": 0,
					"ratio_day": 0,
					"ratio_week": 0,
					"ratio_month": 0
				},
				filterInfo: {
					time_type: 1,
				},
			},
			pagination: {
				total: 0,
				current: 1,
				pageSize: 40,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			loading: true
		}
		this.columns = [
			{
				title: '日期',
				dataIndex: 'date',
			}, {
				title: '资金池',
				dataIndex: 'capital',
				align: 'right',
				width: 250,
				render: (data) => utils.formatMoney(data / 100)
			}, {
				title: '虚拟币',
				dataIndex: 'virtual',
				align: 'right',
				width: 180,
				render: (data) => utils.formatMoney(data / 100)
			}, {
				title: '积分',
				dataIndex: 'bounty',
				align: 'right',
				width: 180,
				render: (data) => utils.formatMoney(data / 100)
			}, {
				title: '红包',
				dataIndex: 'red_envelop',
				align: 'right',
				width: 180,
				render: (data) => utils.formatMoney(data / 100)
			}
		];
		this.format = ['YYYY-MM-DD', 'YYYY-MM-DD', 'YYYY-MM'];
	}

	componentWillMount() {
		this.getCapitalOverview();
		this.getCapitalTrend();
	}

	getCapitalOverview = () => {
		NetReport.getCapitalOverview().then(res => {
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

	getCapitalTrend = () => {
		const dateData = [];
		const virtualData = [];
		const bountyData = [];
		const redEnvelopData = [];
		const state = this.state;

		const data = {
			period: `${moment().startOf('month').format('YYYYMMDD')},${moment().endOf('month').format('YYYYMMDD')}`,
			time_type: 1,
			...state.filterInfo,
		};
		const timeType = state.filterInfo && state.filterInfo.time_type || 2;
		NetReport.getCapitalTrend(data).then(res => {
			const rows = res.data;
			rows.map(item => {
				dateData.push(item.date);
				virtualData.push(Math.floor(item.virtual / 100));
				bountyData.push(Math.floor(item.bounty / 100));
				redEnvelopData.push(Math.floor(item.red_envelop / 100));
			});
			this.setState({
				loading: false,
				capitalTrend: rows,
				dateData: dateData, 
				virtualData: virtualData, 
				bountyData: bountyData, 
				redEnvelopData: redEnvelopData, 
			});

			dateData = null;
			virtualData = null;
			bountyData = null;
			redEnvelopData = null;
			
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
			filterInfo: data,
			capitalTrend: [],
			loading: true,
		}, () => {
			this.getCapitalTrend();
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
			this.getCapitalTrend()
		});
	}

	render() {
		const state = this.state;
		const {
			capitalTrend, 
			capitalOverview, 
			loading, 
			pagination 
		} = state;
		let { 
			dateData, 
			virtualData, 
			bountyData, 
			redEnvelopData, 
		} = state;

		if (capitalTrend.length == 0) {
			dateData = ['10-01', '10-02', '10-03', '10-04', '10-05', '10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12', '10-13', '10-14', '10-15', '10-16', '10-17', '10-18', '10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25', '10-26', '10-27', '10-28', '10-29', '10-30', '10-31'];
			virtualData = [448571, 458821, 469035, 479249, 489553, 499767, 520275, 540783, 561291, 581609, 622615, 663261, 704357, 745453, 786549, 796763, 856977, 897281, 796793, 776215, 755727, 722731, 671541, 620351, 587265, 577071, 566787, 611799, 646517, 656821, 667035];
			bountyData = [423237, 423951, 427173, 430694, 429206, 428505, 426343, 426719, 426140, 425406, 423106, 426771, 425169, 424265, 425641, 473443, 463127, 422476, 422196, 421768, 421719, 420526, 431906, 430044, 435302, 440782, 439486, 433359, 440782, 435302, 431906];
			redEnvelopData = [24328, 234820, 224960, 208860, 190420, 179480, 157240, 140420, 199500, 178360, 157880, 138120, 126180, 112300, 93160, 71840, 54180, 31600, 880, 80, 0, 0, 0, 0, 0, 0, 0, 0];
		}

		let barWidth = 25;
		if (dateData.length > 12) {
			barWidth -= dateData.length - 12;
			if (barWidth < 5) barWidth = 5;
		}

		let interval = 0;
		const len = dateData.length;
		if (len > 30) {
			interval = Math.floor((len - 30) / 20) + 1;
		}

		const items = {
			xAxis: {
				data: dateData,
				axisLabel: {
					interval: interval,
					rotate: len > 12 ? 45 : 0
				}
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			data: [
				{
					name: '虚拟币',
					type: 'bar',
					stack: '1',
					barWidth: barWidth,
					color: '#1890FF',
					data: virtualData
				},
				{
					name: '积分',
					type: 'bar',
					stack: '1',
					barWidth: barWidth,
					color: '#FF6600',
					data: bountyData
				},
				{
					name: '红包',
					type: 'bar',
					stack: '1',
					barWidth: barWidth,
					color: '#D0021B',
					data: redEnvelopData
				}
			]
		}

		const capital = capitalOverview.capital;
		const virtual = capitalOverview.virtual;
		const bounty = capitalOverview.bounty;
		const redEnvelop = capitalOverview.red_envelop;

		return <div className={globalStyles.content}>
					<Card className={classnames(globalStyles.mBottom16, globalStyles.statistic)} bordered={false}>
						<Row gutter={16} className={classnames(globalStyles.mTop16, globalStyles.mBottom24)}>
							<Col span={6}>
								<Statistic value={capital.amount / (100 * 10000)} title="资金账户" precision={2} suffix="万" />
								<ChainRatio data={capital} ratio={100} />
							</Col>
							<Col span={6}>
								<Statistic value={virtual.amount / (100 * 10000)} title="虚拟币账户" precision={2} suffix="万" />
								<ChainRatio data={virtual} ratio={100} />
							</Col>
							<Col span={6}>
								<Statistic value={bounty.amount / (100 * 10000)} title="积分账户" precision={2} suffix="万" />
								<ChainRatio data={bounty} ratio={100} />
							</Col>
							<Col span={6}>
								<Statistic value={redEnvelop.amount / 100} title="红包" precision={2} />
								<ChainRatio data={redEnvelop} ratio={100} />
							</Col>
						</Row>
						<Alert message="本页根据昨日数据来计算，由于服务器缓存，以及指标计算方法和统计时间的差异，数据可能出现微小误差。" type="info" showIcon />
					</Card>
					<Search handleSearch={this.handleSearch} />
					<Card bordered={false} className={globalStyles.mBottom16}>
						<h3>客户资金趋势图</h3>
						<BarChart {...items} style={{ height: '350px' }} />
						{(capitalTrend.length == 0) ? (<NoChartData style={{ paddingTop: '140px' }} />) : null}
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>数据明细</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}><Button disabled={true}>导出Excel</Button></Col>
						</Row>
						<Table
							dataSource={capitalTrend.filter(item => item.capital > 0)}
							columns={this.columns}
							rowKey={record => record.date}
							loading={loading}
							animated={false}
							pagination={false}
							scroll={{ x: 1000 }}
						/>
					</Card>
				</div>
	}
}

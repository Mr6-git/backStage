import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Table,
	Radio,
	Button,
	message
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils from '@/utils';
import BarChart from '@/component/echarts/BarChart';
import PieChart from '@/component/echarts/PieChart';
import LineChart from '@/component/echarts/LineChart';
import NoChartData from '@/component/NoChartData';
import GDPList from '@/component/GDPList';
import Search from './Search';
import NetReport from '@/net/report';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';
import { stat } from 'fs';

const RadioButton = Radio.Button;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: {
				total: 0,
				current: 1,
				pageSize: 10,
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			dateList: [],
			chartObj: {},
			chart: {},
			table: [],
			singleTable: [],
			channel_id: '',
			loading: false,
			activeTab: 1,
			hasData: true,
		}
		this.chart = React.createRef();
		this.tab = [
			{
				id: 1,
				name: '新注册人数',
			}, {
				id: 2,
				name: '充值人数',
			}, {
				id: 3,
				name: '投注人数',
			}, {
				id: 4,
				name: '累计人数'
			}
		]
	}

	componentWillMount() {
		const startDate = moment().startOf('day').add(-15, 'day');
		const endDate = moment().endOf('day');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		const time_exp = `${startDate.unix()},${endDate.unix()}`;

		this.setState({ period });

		const json = {
			period,
			time_exp,
			channel_id: ''
		}
		this.getChannelsReport(json);
		this.getchannelsTop(json);
	}
	
	getchannelsTop = (data) => {
		const json = {
			time_exp: data.period,
			channel_id: data.channel_id,
			type: this.state.activeTab,
		};
		NetReport.getChannelsTop(json).then(res => {
			const data = res.data;
			const dateList = data.list.map(item => item.time);
			const title = data.title;
			let hasData = false;
			let obj = {}; // {0: [], 1: [], 2: [] }

			if (title && title.length) {
				hasData = true;
				const len = title.length;
				for (let i = 0; i < len; i++) {
					obj[i + ''] = [];
					data.list.map(item => {
						obj[i + ''].push(item.number[i])
					})
				}
			}

			data.list.map(item => {
				item.number.map((num, index) => {
					item[`number${index}`] = num;
				})
			})
			
			this.setState({
				dateList,
				chartObj: obj,
				chart: data,
				hasData,
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

	getChannelsReport = (data) => {
		const json = {
			time_exp: data.period,
			channel_id: ''
		};
		NetReport.getChannelsReport(json).then(res => {
			this.setState({
				table: res.data.rows,
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

	getChannelsRSingle = (data) => {
		const json = {
			time_exp: data.period,
			channel_id: data.channel_id,
		};
		NetReport.getChannelsRSingle(json).then(res => {
			this.setState({
				singleTable: res.data,
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
		if (data.channel_id) {
			this.setState({
				period: data.period,
				channel_id: data.channel_id,
				activeTab: 1,
				chart: {},
				dateList: [],
				chartObj: {},
			});
			this.getChannelsRSingle(data)
		} else {
			this.setState({
				period: data.period,
				channel_id: data.channel_id,
				activeTab: 1,
			});
			this.getChannelsReport(data);
		}
		this.getchannelsTop(data);
	}

	handleTab = (e) => {
		const id = e.target.value;
		const { period, channel_id } = this.state;
		const json = {
			period: period,
			channel_id: channel_id,
		}
		this.setState({
			activeTab: id,
		}, () => {
			this.getchannelsTop(json);
		})
	}

	getChartOption(state) {
		let { chart, dateList, chartObj } = state;
		const option = {
			xAxis: { data: [] },
			data: []
		}

		const chartList = Object.values(chartObj);
		const titleList = chart.title;
		const optionData = [];
		
		chartList.map((item, index) => {
			let obj = {
				name: titleList[index],
				smooth: true,
				symbol: 'none',
				type: 'line',
				lineStyle: {
					width: 2
				},
				data: item
			}
			optionData.push(obj);
		})

		option.xAxis = {
			data: dateList,
			axisLabel: {
				interval: 0,
				rotate: 45
			}
		};
		option.data = optionData;
		
		return option;
	}

	getColumns(state) {
		let { chart, dateList, chartObj } = state;
		let col = [
			{
				title: '雅虎直播',
				dataIndex: 'yahu',
				render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
			}, {
				title: '腾讯直播',
				dataIndex: 'tencent',
				render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
			},
		];
		if (chart.title && chart.title.length) {
			col = [];
			chart.title.map((item, index) => {
				let obj = {
					title: item,
					dataIndex: `number${index}`,
					render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
				}
				col.push(obj);
			});
		}

		return [
			{
				title: '时间',
				dataIndex: 'time',
				key: 'time',
				fixed: 'left',
				width: 120,
			},
			...col,
		];
	}

	getInitColumns(channelId) {
		let thisTitle = '渠道名称';
		let key = 'name';
		if (channelId) {
			const item = this.state.table.filter(item => item._id == channelId);
			thisTitle = item && item.length ? item[0].name : '时间';
			key = 'time';
		}

		return [
			{
				title: thisTitle,
				dataIndex: key,
				render: data => {
					if (data) {
						return data;
					}
					return '-';
				}
			},
			{
				title: '新注册人数',
				dataIndex: 'register',
				key: 'register',
				width: 160,
				align: 'right',
				render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
			},
			{
				title: '充值人数',
				dataIndex: 'recharge',
				key: 'recharge',
				width: 160,
				align: 'right',
				render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
			},
			{
				title: '投注人数',
				dataIndex: 'betting',
				key: 'betting',
				width: 160,
				align: 'right',
				render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
			},
			{
				title: !channelId ? '累积人数(%)' : '累积人数',
				dataIndex: 'accrued',
				key: 'accrued',
				align: 'right',
				width: 200,
				render: data => {
					if (data) {
						return data;
					}
					return '-';
				}
			}
		];
	}

	render() {
		const state = this.state;
		const items = this.getChartOption(state);
		
		let columns = this.getInitColumns(state.channel_id);
		let data = state.table;
		if (state.channel_id) {
			data = [];
			data = state.singleTable;
		}

		return <div className={globalStyles.content}>
					<Search channel={state.table} handleSearch={this.handleSearch} />
					<Card bordered={false} className={globalStyles.mTop8}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>TOP10 渠道</h3></Col>
						</Row>
						<Radio.Group
							size="defualt"
							value={state.activeTab}
							onChange={this.handleTab}
							style={{ marginBottom: '12px' }}
						>
							{this.tab.map(item => 
								<RadioButton
									value={item.id}
									key={item.id}
								>{item.name}</RadioButton>
							)}
						</Radio.Group>
						
						<LineChart {...items} style={{ height: '350px' }} key={state.channel_id} ref={i => this.chart = i} />
						{!state.hasData || !(state.chart && state.chart.title && state.chart.title.length) ? 
							<NoChartData style={{ top: '100px', paddingTop: '140px' }} /> : null}
					</Card>
					<Card bordered={false} className={globalStyles.mTop16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>数据明细</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}>
								<Button disabled={true}>导出Excel</Button>
							</Col>
						</Row>
						<Table
							key={state.channel_id}
							dataSource={data}
							columns={columns}
							rowKey={(record, i) => i}
							loading={state.loading}
							animated={false}
							pagination={false}
							scroll={{ x: 900 }}
						/>
					</Card>
				</div>
	}
}

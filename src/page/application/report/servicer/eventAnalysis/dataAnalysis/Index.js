import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import {
	Row,
	Col,
	Tabs,
	Card,
	Table,
	Button,
	Drawer,
	Breadcrumb,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import NetReport from '@/net/report';
import LineChart from '@/component/echarts/LineChart';
import NoChartData from '@/component/NoChartData';
import Search from './Search';
import Detail from './Detail';
import Statistics from './Statistics';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
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
					this.getTrendList();
				},
				onShowSizeChange: (current, size) => {
					this.state.pagination.pageSize = size;
					this.getTrendList();
				},
				showTotal: (total, range) => `共 ${total} 条记录 / ${range[0]} - ${range[1]}`
			},
			currentTab: 'growth',
			trend: [],
			trendList: [],
			dataType: 1,
			time_type: 1,
			isYearOrMonth: true,
		}
		this.items = {
			xAxis: {
				data: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'],
			},
			data: [
				{
					name: '发布赛事数',
					smooth: true,
					symbol: 'none',
					type: 'line',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 281.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}, {
					name: '盈利赛事数',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 8.3, 9.2, 21.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}, {
					name: '亏损赛事数',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}, {
					name: '异常赛事数',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}, {
					name: '走盘赛事数',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}
			]
		}
		this.columns = [
			{
				title: '日期',
				dataIndex: 'date',
				width: 110,
			}, {
				title: '发布赛事(数)',
				dataIndex: 'publish',
				align: 'right',
				width: 120,
			}, {
				title: '盈利赛事(数)',
				align: 'right',
				width: 120,
				render: data => {
					if (data.win > 0) {
						return <a
									href="javascript:;"
									onClick={() => this.open(data._id, 1)}
								>{utils.formatMoney(data.win, 0)}</a>
					}
					return '-';
				}
			}, {
				title: '亏损赛事(数)',
				align: 'right',
				width: 120,
				render: data => {
					if (data.loss > 0) {
						return <a
									href="javascript:;"
									onClick={() => this.open(data._id, 2)}
								>{utils.formatMoney(data.loss, 0)}</a>
					}
					return '-';
				}
			}, {
				title: '异常赛事(数)',
				align: 'right',
				width: 120,
				render: data => {
					if (data.exception > 0) {
						return <a
									href="javascript:;"
									onClick={() => this.open(data._id, 3)}
								>{utils.formatMoney(data.exception, 0)}</a>
					}
					return '-';
				}
			}, {
				title: '走盘赛事(数)',
				align: 'right',
				width: 120,
				render: data => {
					if (data.refund > 0) {
						return <a
									href="javascript:;"
									onClick={() => this.open(data._id, 4)}
								>{utils.formatMoney(data.refund, 0)}</a>
					}
					return '-';
				}
			}, {
				title: '盈利占比',
				dataIndex: 'ratio_win',
				align: 'right',
				width: 105,
				render: data => <Fragment>{(data / 100).toFixed(2)}%</Fragment>
			}, {
				title: '异常占比',
				dataIndex: 'ratio_exception',
				align: 'right',
				width: 105,
				render: data => <Fragment>{(data / 100).toFixed(2)}%</Fragment>
			}
		];
	}

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;
		const time_exp = `${startDate.unix()},${endDate.unix()}`;

		const dataType = localStorage.getItem('dataType');

		const json = {
			period,
			time_type: 1,
			game_id: '',
			event_assort: ''
		}

		this.setState({ 
			...json,
			dataType: dataType ? dataType : 1
		});
		this.getTrend(json);
		this.getTrendList(json);
	}

	componentWillUnmount() {
		localStorage.removeItem('dataType');
	}

	getTrend(json) {
		NetReport.getEventTrend(json).then(res => {
			this.setState({
				trend: res.data,
			});
		}).catch(e => {})
	}

	getTrendList(json) {
		const { time_type, isYearOrMonth } = this.state;
		NetReport.getEventTrendList(json).then(res => {
			let data = res.data;
			if (data && data.length && isYearOrMonth) {
				let dataLen = data.length;
				switch(Number(time_type)) {
					case 2: dataLen = (new Date()).getMonth() + 1; break;
					case 1: dataLen = (new Date()).getDate() - 1; break;
				}
				data = data.slice(0, dataLen)
			}
			this.setState({
				trendList: data.reverse(),
			});
		}).catch(e => {})
	}

	handleSearch = (data) => {
		let isYearOrMonth = false;

		switch(data.time_type) {
			case 2: {
				const year = moment().format('YYYY');
				if (data.period.indexOf(year) > -1) {
					isYearOrMonth = true;
				}
			} break;
			case 1: {
				const month = moment().format('YYYYMM');
				if (data.period.indexOf(month) > -1) {
					isYearOrMonth = true;
				}
			} break;
		}

		this.setState({
			time_type: data.time_type,
			period: data.period,
			game_id: data.game_id,
			event_assort: data.event_assort,
			isYearOrMonth
		}, () => {
			this.getTrend(data);
		this.getTrendList(data);
		});
	}

	handleChart(data) {
		if (!data || !data.length) return;
		const { time_type, isYearOrMonth } = this.state;
		let time = [],
			publish = [],
			win = [],
			loss = [],
			exception = [],
			refund = [];
		data.map(item => {
			// time.push(moment.unix(item.date).format('YYYY-MM-DD'));
			time.push(item.date);
			publish.push(item.publish);
			win.push(item.win);
			loss.push(item.loss);
			exception.push(item.exception);
			refund.push(item.refund);
		});
		
		let interval = 0;
		const len = publish.length;
		if (len > 30) {
			interval = Math.floor((len - 30) / 20) + 1;
		}

		let dataLen = publish.length;
		switch(Number(time_type)) {
			case 2: dataLen = (new Date()).getMonth() + 1; break;
			case 1: dataLen = (new Date()).getDate() - 1; break;
		}
		if (isYearOrMonth && dataLen != publish.length) {
			publish.length = dataLen;
			win.length = dataLen;
			loss.length = dataLen;
			exception.length = dataLen;
			refund.length = dataLen;
		}

		return {
			xAxis: {
				data: time,
				axisLabel: {
					interval: interval,
					rotate: len > 12 ? 45 : 0
				}
			},
			yAxis: {
				type: 'value'
			},
			type: 'line',
			smooth: true,
			data: [
				{
					name: '发布赛事数',
					symbol: 'circle',
					showSymbol: publish.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: publish,
				}, {
					name: '盈利赛事数',
					symbol: 'circle',
					showSymbol: win.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: win,
				}, {
					name: '亏损赛事数',
					symbol: 'circle',
					showSymbol: loss.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: loss,
				}, {
					name: '异常赛事数',
					symbol: 'circle',
					showSymbol: exception.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: exception,
				}, {
					name: '走盘赛事数',
					symbol: 'circle',
					showSymbol: refund.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: refund,
				}
			]
		}
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	open(id, type) {
		this.setState({
			dataType: type,
		});
		localStorage.setItem('dataType', type);
		this.props.history.push(`${this.props.match.url}/${id}`);
	}

	renderTitle(dataType) {
		switch (Number(dataType)) {
			case 1: return '盈利赛事';
			case 2: return '亏损赛事';
			case 3: return '异常赛事';
			case 4: return '走盘赛事';
		}
	}

	render() {
		const state = this.state;
		const { trend, trendList, pagination, period, game_id, event_assort, time_type, dataType } = state;
		const _items = trend && trend.length ? this.handleChart(trend) : this.items;

		return <div className={globalStyles.content}>
					<Search handleSearch={this.handleSearch} />
					<Statistics period={period} game_id={game_id} event_assort={event_assort} time_type={time_type} />
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>赛事趋势</h3></Col>
						</Row>
						<LineChart {..._items} style={{ height: '350px' }} />
						{!(trend && trend.length) ? <NoChartData style={{ paddingTop: '140px' }} /> : null}

					</Card>
					<Card bordered={false}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>数据明细</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}>
								<Button disabled={true}>导出Excel</Button>
							</Col>
						</Row>
						<Table
							dataSource={trendList}
							columns={this.columns}
							rowKey={(record, index) => index }
							loading={state.loading}
							animated={false}
							pagination={false}
							scroll={{ x: 1000 }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/:detail`}
						children={(childProps) => {
							return <Drawer
										title={this.renderTitle(dataType)}
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<Detail
											currentTab={this.props.currentTab}
											id={childProps.match ? childProps.match.params.detail : null}
											dataType={dataType}
										/>
									</Drawer>
						}}
					/>
				</div>
	}
}

import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Row,
	Col,
	Spin,
	Tabs,
	Card,
	List,
	Table,
	Button,
	Drawer,
	Divider,
	Statistic,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import LineChart from '@/component/echarts/LineChart';
import PieChart from '@/component/echarts/PieChart';
import NoChartData from '@/component/NoChartData';
import DataLeagueLevels from '@/data/LeagueLevels';
import DataGlobalParams from '@/data/GlobalParams';
import DataAgencys from '@/data/Agencys';
import DataGames from '@/data/Games';
import DataTeam from '@/data/Team';
import NetReport from '@/net/report';
import Search from './Search';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;

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
			loading: true,
			loadingEvent: true,
			coinRate: DataGlobalParams.getCoinRate(),
			currentTab: 'growth',
			trendList: [],
			agencyTree: [],
			scan: {},
			pieTable: {
				win: [],
				loss: [],
			},
			pie: {
				win: [],
				loss: [],
			},
			time_type: 1,
			isYearOrMonth: true,
		}
		this.format = ['YYYY-MM-DD', 'YYYY-MM', 'YYYY-MM-DD', 'YYYY-MM-DD'];
		this.items = {
			xAxis: {
				data: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'],
			},
			data: [
				{
					name: '投注额',
					smooth: true,
					type: 'line',
					symbol: 'none',
					lineStyle: {
						width: 2
					},
					data: [3.9, 5.9, 11.1, 18.7, 8.3, 9.2, 21.6, 46.6, 55.4, 18.4, 10.3, 0.7],
				}, {
					name: '派奖额',
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
				width: 80,
			}, {
				title: '赛事数',
				dataIndex: 'events',
				align: 'right',
				width: 95,
				render: data => <Fragment>{utils.formatMoney(data, 0)}</Fragment>
			}, {
				title: '订单数',
				dataIndex: 'orders',
				width: 135,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '投注人数',
				dataIndex: 'customers',
				width: 130,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '投注额',
				dataIndex: 'bet_group',
				width: 185,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre / 100) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay / 100) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '总投注额',
				dataIndex: 'bet_amount',
				align: 'right',
				width: 155,
				render: data => <Fragment>{utils.formatMoney(data / 100)}</Fragment>
			}, {
				title: '派奖率',
				dataIndex: 'return_ratio',
				align: 'right',
				width: 100,
				render: data => <Fragment>{data ? `${(data / 100).toFixed(2)}%` : '-'}</Fragment>
			}, {
				title: '机构盈亏',
				dataIndex: 'profit_amount',
				align: 'right',
				width: 150,
				render: data => {
					return <div className={data > 0 ? styles.green : styles.orange}>{utils.formatMoney(data / 100)}</div>
				}
			}
		];
		this.columnsHour = [
			{
				title: '赛事ID',
				dataIndex: '_id',
				fixed: 'left',
				width: 100,
				render: data => <a href="javascript:;" data-id={data} onClick={this.open}>{data}</a>
			}, {
				title: '参赛队伍',
				key: 'teams',
				render: data => {
					return <Fragment>
								{data.home_team} <b className={globalStyles.blue}>vs</b> {data.away_team}
							</Fragment>
				}
			}, {
				title: '等级',
				dataIndex: 'level_id',
				width: 80,
				render: data => DataLeagueLevels.getLevel(data)
			}, {
				title: '风险',
				dataIndex: 'risk_level',
				width: 80,
				render: data => {
					switch (Number(data)) {
						case 1: return  <span style={{ color: '#FF0066' }}>极高</span>; break;
						case 2: return  <span style={{ color: '#6633FF' }}>高</span>; break;
						case 3: return  <span style={{ color: '#1890FF' }}>中</span>; break;
						case 4: return  <span style={{ color: '#009999' }}>低</span>; break;
						case 5: return  <span style={{ color: '#999999' }}>极低</span>; break;
						default: return  '-';
					}
				}
			}, {
				title: '开赛时间',
				dataIndex: 'begin_time',
				key: 'begin_time',
				width: 180,
				render: data => {
					if (data) {
						return moment.unix(data).format('YYYY-MM-DD HH:mm');
					}
					return '-';
				},
			},{
				title: '订单数',
				dataIndex: 'orders',
				width: 120,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '投注人数',
				dataIndex: 'customers',
				width: 120,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '投注额',
				dataIndex: 'bet_group',
				width: 140,
				render: data => {
					if (!data.pre && !data.inplay) {
						return '-'
					}
					return <Fragment>
								<div>早：{data.pre ? utils.formatMoney(data.pre / 100, 0) : '-'}</div>
								<div>滚：{data.inplay ? utils.formatMoney(data.inplay / 100, 0) : '-'}</div>
							</Fragment>
				}
			}, {
				title: '总投注额',
				dataIndex: 'bet_amount',
				align: 'right',
				width: 140,
				render: data => <Fragment>{utils.formatMoney(data / 100)}</Fragment>
			}, {
				title: '派奖率',
				dataIndex: 'return_ratio',
				align: 'right',
				width: 90,
				render: data => <Fragment>{(data / 100).toFixed(2)}%</Fragment>
			}, {
				title: '机构盈亏',
				dataIndex: 'profit_amount',
				align: 'right',
				width: 140,
				render: data => {
					return <div className={data > 0 ? styles.green : styles.orange}>{utils.formatMoney(data / 100)}</div>
				}
			}
		];
	}

	componentWillMount() {
		const startDate = moment().startOf('month');
		const endDate = moment().endOf('month');
		const period = `${startDate.format('YYYYMMDD')},${endDate.format('YYYYMMDD')}`;

		const json = {
			period,
			time_type: 1,
			agency_id: DataTeam.currentId
		}
		
		this.getScan(json);
		this.getTrend(json);
		this.getProfitByGame(json);
		this.getProfitByEvent(json);
		this.getTrendList(json);
		this.getAgencyTree();

		this.setState({ ...json });
	}

	getScan(json) {
		NetReport.getProfitScan(json).then(res => {
			this.setState({
				scan: res.data,
			});
		}).catch(e => {})
	}

	getTrend(json) {
		NetReport.getProfitTrend(json).then(res => {
			this.setState({
				trend: res.data,
			});
		}).catch(e => {})
	}

	getProfitByGame(json) {
		NetReport.getProfitByGame(json).then(res => {
			if (res.code == 200) {
				const data = res.data;
				if (!data.win || !data.win.rows) return;
				data.win.rows.map(item => {
					item.name = DataGames.getField(item.game_id, 'name');
					item.value = item.event_num;
					item.icon = 'circle';
				})
				data.loss.rows.map(item => {
					item.name = DataGames.getField(item.game_id, 'name');
					item.value = item.event_num;
					item.icon = 'circle';
				})
				this.setState({
					pie: data,
				});
			}
		})
	}

	getProfitByEvent(json) {
		NetReport.getProfitByEvent(json).then(res => {
			if (res.code == 200) {
				const data = res.data;
				if (!data.win) return;
				data.win.map(item => {
					item.name = `${item.home_team} vs ${item.away_team}`;
					item.value = item.profit / 100;
				})
				data.loss.map(item => {
					item.name = `${item.home_team} vs ${item.away_team}`;
					item.value = item.profit / 100;
				})
				this.setState({
					pieTable: data,
					loadingEvent: false,
				});
			}
		})
	}

	getTrendList(data) {
		const { time_type } = this.state;
		const timeType = data ? data.time_type : time_type
		switch (timeType) {
			case 3: this.getDayList(data); break; // 按时
			default: this.getTrendNormal(data); break; // 其他
		}
	}

	getTrendNormal = (data) => {
		const json = {
			...data,
		}
		NetReport.getProfitTrendList(json).then(res => {
			let data = res.data;
			const { time_type, isYearOrMonth } = this.state;
			if (data && data.length && isYearOrMonth) {
				let dataLen = data.length;
				switch(Number(time_type)) {
					case 2: dataLen = (new Date()).getMonth() + 1; break;
					case 1: dataLen = (new Date()).getDate() - 1; break;
				}
				data = data.slice(0, dataLen)
			}
			this.setState({
				trendList: data,
				loading: false,
			});
		}).catch(e => {})
	}

	getDayList = (data) => {
		const { pagination, time_type, period } = this.state;
		const json = {
			limit: pagination.pageSize,
			page: pagination.current,
			time_type,
			period,
			...data,
		}
		NetReport.getProfitDayList(json).then(res => {
			this.state.pagination.total = res.data.pagination ? res.data.pagination.total : 0;
			this.setState({
				trendList: res.data.rows ? res.data.rows : [],
				loading: false,
			});
		}).catch(e => {})
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	handleSearch = (data) => {
		this.state.pagination.current = 1;

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
			trendList: [],
			loading: true,
			period: data.period,
			time_type: data.time_type,
			agency_id: data.agency_id,
			isYearOrMonth
		}, () => {
			this.getScan(data);
			this.getTrend(data);
			this.getProfitByGame(data);
			this.getProfitByEvent(data);
			this.getTrendList(data);
		});
	}

	handleChart(data) {
		if (!data || !data.length) return;
		const { time_type, isYearOrMonth } = this.state;
		let time = [],
			bet = [],
			betSettles = [];
		data.map(item => {
			time.push(item.date);
			bet.push(item.bet_amount / 100);
			betSettles.push(item.return_amount / 100);
		});
		
		let interval = 0;
		const len = bet.length;
		if (len > 30) {
			interval = Math.floor((len - 30) / 20) + 1;
		}

		let dataLen = bet.length;
		switch(Number(time_type)) {
			case 2: dataLen = (new Date()).getMonth() + 1; break;
			case 1: dataLen = (new Date()).getDate() - 1; break;
		}
		if (isYearOrMonth && dataLen != bet.length) {
			bet.length = dataLen;
			betSettles.length = dataLen;
		}

		return {
			xAxis: {
				data: time,
				axisLabel: {
					interval: interval,
					rotate: len > 12 ? 45 : 0
				}
			},
			data: [
				{
					name: '投注额',
					symbol: 'circle',
					showSymbol: bet.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: bet,
				}, {
					name: '派奖额',
					symbol: 'circle',
					showSymbol: betSettles.length == 1 ? true : false,
					lineStyle: {
						width: 2
					},
					data: betSettles,
				},
			],
			type: 'line',
			smooth: true,
		}
	}

	open = (e) => {
		const id = e.currentTarget.dataset.id;
		localStorage.setItem('eventListEid', id)
		this.props.history.push(`${this.props.match.url}/event/${id}`);
	}

	onClose = () => {
		this.props.history.push(this.props.match.url);
	}

	onTabClick = (key) => {
		this.setState({
			currentTab: key,
		});
	}

	renderPieTable(key, state) {
		const { pie, pieTable, loadingEvent } = state;
		const chart = key == 'growth' ? pie.win : pie.loss;
		const data = key == 'growth' ? pieTable.win : pieTable.loss;
		const opTitle = {
			text: `${key == 'growth' ? '盈利' : '亏损'}赛事总数`,
			subtext: utils.formatMoney(chart.total ? chart.total : 0, 0) + '',
			left: 'center',
			top: '36%',
			padding: [24, 0],
			textStyle:{
				color: '#929292',
				fontSize: 14,
				fontWeight: 'lighter',
				align: 'center'
			},
			subtextStyle:{
				color: '#272727',
				fontSize: 17,
				align: 'center'
			}
		}
		return <Fragment>
					<Row gutter={16} className={globalStyles.mTop24}>
						<Col span={11}>
							<PieChart
								title={`${key == 'growth' ? '盈利' : '亏损'}赛事数`}
								data={chart.rows ? chart.rows : []}
								opTitle={opTitle}
								style={{ height: 370 }}
							/>
						</Col>
						<Col span={1}><Divider type="vertical" style={{ height: '380px' }} /></Col>
						<Col span={12}>
							{loadingEvent ? <Fragment>
									<Row style={{ paddingTop: 14, color: '#999999' }}>
										<Col span={9}>赛事</Col>
										<Col span={3} style={{ textAlign: 'right' }}>订单数</Col>
										<Col span={6} style={{ textAlign: 'right' }}>投注额</Col>
										<Col span={6} style={{ textAlign: 'right' }}>盈亏</Col>
									</Row>
									<div className={globalStyles.flexCenter} style={{ paddingTop: '30%' }}><Spin /></div>
							</Fragment> : <List
								size="small"
								header={(
									<Row>
										<Col span={9}>赛事</Col>
										<Col span={3} style={{ textAlign: 'right' }}>订单数</Col>
										<Col span={6} style={{ textAlign: 'right' }}>投注额</Col>
										<Col span={6} style={{ textAlign: 'right' }}>{key == 'growth' ? '盈利' : '亏损'}</Col>
									</Row>
								)}
								className={styles.tableWrap}
								bordered={false}
								dataSource={data.rows || data}
								renderItem={item => (
									<Row className={styles.font15}>
										<Col span={9} className={styles.font14}>
											<a href="javascript:;" data-id={item.event_id} onClick={this.open}>{item.name}</a>
										</Col>
										<Col span={3} className={styles.mGrey} style={{ textAlign: 'right' }}>
											{utils.formatMoney(item.order_num, 0)}
										</Col>
										<Col span={6} className={styles.mGrey} style={{ textAlign: 'right' }}>
											{utils.formatMoney(item.amount / 100)}
										</Col>
										<Col span={6} style={{ color: key == 'growth' ? '#4DCB73' : '#FF9C5A', textAlign: 'right' }}>
											{utils.formatMoney(item.profit / 100)}
										</Col>
									</Row>
								)}
							/>}
						</Col>
					</Row>
					{!(data && data.rows && data.rows.length) && !(chart && chart.rows && chart.rows.length) ? <NoChartData style={{ paddingTop: '120px' }} /> : null}
				</Fragment>
	}

	render() {
		const state = this.state;
		const {
			trendList,
			pagination,
			loading,
			currentTab,
			agencyTree,
			scan,
			trend,
			time_type
		} = state;
		const _items = trend && trend.length ? this.handleChart(trend) : this.items;

		let profitAmountColor = '#009933';
		if (scan.profit_amount < 0) {
			profitAmountColor = '#FF5B01';
		}

		return <div className={globalStyles.content}>
					<Search agencyTree={agencyTree} handleSearch={this.handleSearch} />
					<Card className={classnames(globalStyles.mBottom16, globalStyles.statistic)} bordered={false}>
						<h3>投注统计</h3>
						<div gutter={16} className={classnames(globalStyles.mTop12, globalStyles.mBottom8, globalStyles.flex)}>
							<div style={{ width: '18%' }}>
								<Statistic value={scan.events ? scan.events: 0} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
								<div className={styles.tip}>赛事数</div>
							</div>
							<Divider type="vertical" style={{ height: '11em' }} />
							<div style={{ width: '82%' }}>
								<Row gutter={16}>
									<Col span={7} className={globalStyles.mBottom12}>
										<Statistic value={scan.orders ? scan.orders: 0} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
										<div className={styles.tip}>订单数</div>
									</Col>
									<Col span={8}>
										<Statistic value={scan.return_amount ? scan.return_amount / 100 : 0} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
										<div className={styles.tip}>派奖总额</div>
									</Col>
									<div className={globalStyles.noRightBorder}>
										<Col span={9} className={globalStyles.mBottom12}>
											<Statistic value={scan.bet_amount ? scan.bet_amount / 100 : 0} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
											<div className={styles.tip}>投注总额</div>
										</Col>
									</div>
									<Col span={7}>
										<Statistic value={scan.customers ? scan.customers: 0} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
										<div className={styles.tip}>投注人数</div>
									</Col>
									<Col span={8}>
										<Statistic value={scan.return_ratio ? scan.return_ratio / 100 : 0} title="" precision={2} valueStyle={{ fontSize: '35px' }} suffix="%" />
										<div className={styles.tip}>派奖率</div>
									</Col>
									<div className={globalStyles.noRightBorder}>
										<Col span={9}>
											<Statistic value={scan.profit_amount ? scan.profit_amount / 100 : 0} title="" precision={0} valueStyle={{ fontSize: '35px', color: profitAmountColor}} />
											<div className={styles.tip}>机构盈亏总额</div>
										</Col>
									</div>
								</Row>
							</div>
						</div>
					</Card>
					<Card bordered={false} className={globalStyles.mBottom16}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>投注趋势</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}>
								<Button disabled={true}>导出Excel</Button>
							</Col>
						</Row>
						<LineChart {..._items} style={{ height: '350px' }} />
						{!(trend && trend.length) ? <NoChartData style={{ paddingTop: '140px' }} /> : null}
					</Card>
					<Card bordered={false} className={classnames(globalStyles.mBottom16, styles.spread)}>
						<Tabs
							tabBarStyle={{margin: 0}}
							animated={{inkBar: true, tabPane: false}}
							activeKey={currentTab}
							onChange={this.onTabClick}
						>
							<TabPane tab="盈利赛事" key="growth">
								{this.renderPieTable('growth', state)}
							</TabPane>
							<TabPane tab="亏损赛事" key="flow">
								{this.renderPieTable('flow', state)}
							</TabPane>
						</Tabs>
					</Card>
					<Card bordered={false}>
						<Row gutter={20} className={globalStyles.mBottom8}>
							<Col span={12}><h3>数据明细</h3></Col>
							<Col span={12} style={{ textAlign: 'right' }}>
								<Button disabled={true}>导出Excel</Button>
							</Col>
						</Row>
						{time_type != 3 ? (
							<Table
								dataSource={trendList}
								columns={this.columns}
								rowKey={(record, index) => index }
								loading={loading}
								animated={false}
								pagination={false}
								scroll={{ x: 1020 }}
							/>
						) : (
							<Table
								dataSource={trendList}
								columns={this.columnsHour}
								rowKey={(record, index) => index }
								loading={loading}
								animated={false}
								pagination={pagination}
								scroll={{ x: 1430 }}
							/>
						)}
					</Card>
				</div>
	}
}

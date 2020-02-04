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
	Radio,
	Button,
	Drawer,
	Divider,
	Statistic,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataLeagueLevels from '@/data/LeagueLevels';
import DataGlobalParams from '@/data/GlobalParams';
import DataAgencys from '@/data/Agencys';
import DataGames from '@/data/Games';
import DataTeam from '@/data/Team';
import NetReport from '@/net/report';
import Search from './Search';
import CombinedDetail from './Detail';
import EventDetail from './detail/EventDetail';
import ProfitDetail from './detail/ProfitDetail';
import styles from '../../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

import NoChartData from '@/component/NoChartData';
import PieChart from '@/component/echarts/PieChart';
import ColumnarChart from '@/component/echarts/ColumnarChart';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
			league_id: '',
			date: '',
			scan: {},
			profitLoss: {
				win: [],
				loss: []
			},
			rank: {
				agent: [],
				customer: [],
				op: [],
			},
			betRatio: {
				agent: {},
				op: {},
			},
			rankActive: 'agent',
			betActive: 'agent',
			key: 'single', // 详情key
			currentTab: 'growth',
			trendList: [],
			time_type: 2,
			isYearOrMonth: true,
		}
		this.defaultRank = {
			agent: [
				{_id: "1141672510098509824", name: "网易", value: 800},
				{_id: "1134625846519140352", name: "锦鲤赛事", value: 5000},
			],
			customer: [
				{_id: "1189461636742684672", name: "用户393", value: 100},
				{_id: "1135727591961923585", name: "用户231", value: 417.50},
				{_id: "1141553806543163392", name: "用户572", value: 2016},
				{_id: "1145630282091597824", name: "用户164", value: 13171},
			],
			op: [
				{_id: "1136154883116765184", name: "比赛胜负-GRF", value: 121},
				{_id: "1136157042587734017", name: "第一局一血-Liquid", value: 652},
				{_id: "1136154883116765185", name: "比赛胜负-JT", value: 1051},
			]
		}
		this.defaultBetRatio = {
			agent: [
				{_id: "1141672510098509824", name: "网易", value: 151, ratio: 30},
				{_id: "1134625846519140352", name: "锦鲤赛事", value: 700, ratio: 143}
			],
			op: [
				{_id: "1136154883116765184", name: "比赛胜负-GRF", value: 121},
				{_id: "1136157042587734017", name: "第一局一血-Liquid", value: 652},
				{_id: "1136154883116765185", name: "比赛胜负-JT", value: 1051},
			]
		}
		this.columns = [
			{
				title: '日期',
				dataIndex: 'date',
				width: 120,
			}, {
				title: '赛事数',
				key: 'events',
				align: 'right',
				width: 80,
				render: data => <a data-date={data.date} data-key="single" onClick={this.openDetail}>{utils.formatMoney(data.events, 0)}</a>
			}, {
				title: '订单数',
				dataIndex: 'orders',
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
				render: data => <Fragment>{utils.formatMoney(data / 100)}</Fragment>
			}, {
				title: '派奖率',
				dataIndex: 'return_ratio',
				align: 'right',
				width: 100,
				render: data => <Fragment>{data ? `${(data / 100).toFixed(2)}%` : '-'}</Fragment>
			}, {
				title: '盈亏',
				dataIndex: 'profit_amount',
				align: 'right',
				width: 150,
				render: data => {
					return <div className={data > 0 ? styles.green : styles.orange}>{utils.formatMoney(data / 100)}</div>
				}
			}, {
				title: '机构',
				key: 'agency',
				align: 'right',
				width: 80,
				render: data => <a  data-date={data.date} data-key="agency" onClick={this.openDetail}>机构</a>
			}
		];
	}

	componentWillMount() {}

	getScan() {
		NetReport.getLeagueScan({
			league_id: this.state.league_id,
		}).then(res => {
			this.setState({
				scan: res.data,
			});
		}).catch(e => {})
	}

	getLeagueProfitLoss() {
		NetReport.getLeagueProfitLoss({
			league_id: this.state.league_id,
			limit: 7,
		}).then(res => {
			const data = res.data;

			data.win.map(item => {
				item.name = `${item.home_team} vs ${item.away_team}`;
				item.value = item.profit / 100;
			})
			data.loss.map(item => {
				item.name = `${item.home_team} vs ${item.away_team}`;
				item.value = item.profit / 100;
			})

			this.setState({
				profitLoss: data,
				loadingEvent: false,
			});
		}).catch(e => {})
	}

	getTrendList() {
		const { pagination, league_id } = this.state;
		const json = {
			league_id,
			limit: pagination.pageSize,
			page: pagination.current,
		}
		NetReport.getLeagueTrend(json).then(res => {
			this.state.pagination.total = res.data.pagination ? res.data.pagination.total : 0;
			this.setState({
				trendList: res.data.rows,
				loading: false,
			});
		}).catch(e => {})
	}

	getRank() {
		NetReport.getLeagueRank({
			league_id: this.state.league_id,
		}).then(res => {
			const data = res.data;
			data.agent && data.agent.length && data.agent.map(item => {
				item.value = item.total / 100;
				item.icon = 'circle';
			})
			data.agent = data.agent.slice(0, 5);
			data.customer && data.customer.length && data.customer.map(item => {
				item.value = item.total / 100;
				item.icon = 'circle';
			})
			data.customer = data.customer.slice(0, 5);
			data.op && data.op.length && data.op.map(item => {
				item.value = item.total / 100;
				item.icon = 'circle';
			})
			data.op = data.op.slice(0, 5);
			this.setState({
				rank: data
			})
		}).catch(err => {})
	}

	getBetRatio() {
		NetReport.getLeagueBet({
			league_id: this.state.league_id,
			limit: 10,
		}).then(res => {
			const data = res.data;
			data.agent.rows && data.agent.rows.length && data.agent.rows.map(item => {
				item.value = item.amount / 100;
				item.icon = 'circle';
			})
			data.op.rows && data.op.rows.length && data.op.rows.map(item => {
				item.value = item.amount / 100;
				item.icon = 'circle';
			})
			this.setState({
				betRatio: data
			});
		}).catch(err => {})
	}

	handleSearch = (league_id) => {
		this.state.pagination.current = 1;

		this.setState({
			league_id,
		}, () => {
			this.getScan();
			this.getLeagueProfitLoss();
			this.getTrendList();
			this.getRank();
			this.getBetRatio();
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

	handleRank = (e) => {
		const val = e.target.value;
		if (val == this.state.rankActive) return;
		this.setState({
			rankActive: val,
		});
	}

	handleBetRatio = (e) => {
		const val = e.target.value;
		if (val == this.state.betActive) return;
		this.setState({
			betActive: val,
		});
	}

	open = (e) => {
		const id = e.currentTarget.dataset.id;
		localStorage.setItem('eventListEid', id)
		this.props.history.push(`${this.props.match.url}/event/${id}`);
	}

	openEvent = () => {
		this.props.history.push(`${this.props.match.url}/event_by_league/${this.state.league_id}`);
	}

	openProfit = () => {
		this.props.history.push(`${this.props.match.url}/profit_rank/${this.state.league_id}`);
	}

	openDetail = (e) => {
		const dataset = e.currentTarget.dataset;
		this.setState({
			date: dataset.date,
			key: dataset.key
		}, () => {
			this.props.history.push(`${this.props.match.url}/detail/${this.state.league_id}`);
		})
	}

	onClose = () => {
		this.setState({
			date: '',
		});
		this.props.history.push(this.props.match.url);
	}

	renderEventTable(state) {
		const { profitLoss, loadingEvent } = state;
		return <Fragment>
					<Row gutter={40} style={{ display: 'flex', height: 310, }}>
						<div className={styles.colBordered}>
							<Col span={12} style={{ width: '100%', height: '100%' }}>
								<h3>盈利赛事</h3>
								{loadingEvent ? <Fragment>
											<Row style={{ paddingTop: 14, color: '#999999' }}>
												<Col span={9}>赛事</Col>
												<Col span={3} style={{ textAlign: 'right' }}>订单数</Col>
												<Col span={6} style={{ textAlign: 'right' }}>投注额</Col>
												<Col span={6} style={{ textAlign: 'right' }}>盈利</Col>
											</Row>
											<div className={globalStyles.flexCenter} style={{ paddingTop: '30%' }}><Spin /></div>
									</Fragment> : <List
										size="small"
										header={(
											<Row>
												<Col span={9}>赛事</Col>
												<Col span={3} style={{ textAlign: 'right' }}>订单数</Col>
												<Col span={6} style={{ textAlign: 'right' }}>投注额</Col>
												<Col span={6} style={{ textAlign: 'right' }}>盈利</Col>
											</Row>
										)}
										className={styles.tableWrap}
										bordered={false}
										dataSource={profitLoss.win}
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
												<Col span={6} style={{ textAlign: 'right' }} className={styles.green}>
													{utils.formatMoney(item.profit / 100)}
												</Col>
											</Row>
										)}
									/>}
							</Col>
						</div>
						
						{/* <Col span={1} className={globalStyles.flex} style={{ display: 'flex', justifyContent: 'center' }}>
							<Divider type="vertical" style={{ height: '400px' }} />
						</Col> */}
						<Col span={12}>
							<h3>亏损赛事</h3>
							{loadingEvent ? <Fragment>
									<Row style={{ paddingTop: 14, color: '#999999' }}>
										<Col span={9}>赛事</Col>
										<Col span={3} style={{ textAlign: 'right' }}>订单数</Col>
										<Col span={6} style={{ textAlign: 'right' }}>投注额</Col>
										<Col span={6} style={{ textAlign: 'right' }}>亏损</Col>
									</Row>
									<div className={globalStyles.flexCenter} style={{ paddingTop: '30%' }}><Spin /></div>
							</Fragment> : <List
								size="small"
								header={(
									<Row>
										<Col span={9}>赛事</Col>
										<Col span={3} style={{ textAlign: 'right' }}>订单数</Col>
										<Col span={6} style={{ textAlign: 'right' }}>投注额</Col>
										<Col span={6} style={{ textAlign: 'right' }}>亏损</Col>
									</Row>
								)}
								className={styles.tableWrap}
								bordered={false}
								dataSource={profitLoss.loss}
								renderItem={item => (
									<Row className={styles.font15}>
										<Col span={9} className={classnames(styles.font14, styles.overflow)}>
											<a href="javascript:;" data-id={item.event_id} onClick={this.open}>{item.name}</a>
										</Col>
										<Col span={3} className={styles.mGrey} style={{ textAlign: 'right' }}>
											{utils.formatMoney(item.order_num, 0)}
										</Col>
										<Col span={6} className={styles.mGrey} style={{ textAlign: 'right' }}>
											{utils.formatMoney(item.amount / 100)}
										</Col>
										<Col span={6} style={{ textAlign: 'right' }} className={styles.orange}>
											{utils.formatMoney(item.profit / 100)}
										</Col>
									</Row>
								)}
							/>}
						</Col>
					</Row>
					{/* {!(profitLoss && profitLoss.loss && profitLoss.loss.length) ? <NoChartData style={{ paddingTop: '120px' }} /> : null} */}
				</Fragment>
	}

	render() {
		const state = this.state;
		const {
			pagination,
			loading,
			scan,
			date,
			key,
			rank,
			betRatio,
			rankActive,
			betActive,
			trendList,
			trend,
		} = state;

		let profitAmountColor = '#009933';
		if (scan.profit_amount < 0) {
			profitAmountColor = '#FF5B01';
		}

		const opTitle = {
			text: '总投注额',
			subtext: utils.formatMoney(betRatio[betActive].total ? betRatio[betActive].total : 0, 0) + '',
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

		return <div className={globalStyles.content}>
					<Search handleSearch={this.handleSearch} />

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
											<div className={styles.tip}>盈亏总额</div>
										</Col>
									</div>
								</Row>
							</div>
						</div>
					</Card>

					<Card bordered={false} className={classnames(globalStyles.mBottom16, styles.spread)}>
						{this.renderEventTable(state)}
						<div style={{ marginTop: 25, textAlign: 'center' }}>
							<a onClick={this.openEvent}>查看全部赛事>></a>
						</div>
					</Card>

					<div className={classnames(globalStyles.flex, globalStyles.mBottom16)}>
						<Row gutter={16} style={{ width: '100%', marginLeft: 0, marginRight: 0, }}>
							<Col span={12} style={{ paddingLeft: 0 }}>
								<Card title='盈亏排行（TOP5）' bordered={false}>
									<RadioGroup value={rankActive} onChange={this.handleRank}>
										<RadioButton value="agent">机构</RadioButton>
										<RadioButton value="customer">客户</RadioButton>
										<RadioButton value="op">竞猜选项</RadioButton>
									</RadioGroup>
									<div style={{ position: 'relative' }}>
										<ColumnarChart
											title="投注盈亏"
											data={rank[rankActive] && rank[rankActive].length ? rank[rankActive] : this.defaultRank[rankActive]}
											style={{ height: 250 }}
										/>
										{!(rank[rankActive] && rank[rankActive].length) ? <NoChartData style={{ top: 15 }} /> : null}
									</div>
									<div style={{ marginTop: 15, textAlign: 'right' }}>
										<a onClick={this.openProfit}>查看更多>></a>
									</div>
								</Card>
							</Col>
							<Col span={12} style={{ paddingRight: 0 }}>
								<Card title='投注占比（TOP10）' bordered={false}>
									<RadioGroup value={betActive} onChange={this.handleBetRatio}>
										<RadioButton value="agent">机构</RadioButton>
										<RadioButton value="op">竞猜选项</RadioButton>
									</RadioGroup>
									<div style={{ position: 'relative', marginBottom: 26 }}>
										<PieChart
											title="总投注额"
											data={betRatio[betActive].rows && betRatio[betActive].rows.length ? betRatio[betActive].rows : this.defaultBetRatio[betActive]}
											opTitle={opTitle}
											style={{ height: 260 }}
										/>
										{!(betRatio[betActive].rows && betRatio[betActive].rows.length) ? <NoChartData style={{ top: 15 }} /> : null}
									</div>
								</Card>
							</Col>
						</Row>
					</div>

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
							loading={loading}
							animated={false}
							pagination={pagination}
							scroll={{ x: 1000 }}
						/>
					</Card>
					<Route
						path={`${this.props.match.path}/event_by_league/:detail`}
						children={(childProps) => {
							let leagueId = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								leagueId = childProps.match.params.detail;
							}
							return <Drawer
										// title={!date ? '全部赛事' : '单日赛事'}
										title='全部赛事'
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<EventDetail
											{...this.props}
											leagueId={leagueId}
											date={date}
											getData={this.getScan}
											onClose={this.onClose}
										/>
									</Drawer>
						}}
					/>
					<Route
						path={`${this.props.match.path}/profit_rank/:detail`}
						children={(childProps) => {
							let leagueId = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								leagueId = childProps.match.params.detail;
							}
							return <Drawer
										// title={!date ? '全部赛事' : '单日赛事'}
										title='盈亏排行'
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<ProfitDetail
											{...this.props}
											tabId='1'
											leagueId={leagueId}
											getData={this.getScan}
											onClose={this.onClose}
										/>
									</Drawer>
						}}
					/>
					<Route
						path={`${this.props.match.path}/detail/:detail`}
						children={(childProps) => {
							let leagueId = 0;
							if (childProps.match && childProps.match.params && childProps.match.params.detail) {
								leagueId = childProps.match.params.detail;
							}
							return <Drawer
										title='详情'
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<CombinedDetail
											{...this.props}
											leagueId={leagueId}
											date={date}
											tabKey={key}
											getData={this.getScan}
											onClose={this.onClose}
										/>
									</Drawer>
						}}
					/>
				</div>
	}
}

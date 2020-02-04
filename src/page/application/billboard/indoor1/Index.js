import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Empty,
	Progress,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGames from '@/data/Games';
import DataMarketType from '@/data/MarketType';
import DataLeagueLevels from '@/data/LeagueLevels';
import NetReport from '@/net/report';
import styles from './styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

import AnimateNumber from '@/component/animateNumber/Index';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			event: [],
			activeEvent: {},
			activeId: '',
			info: {},
			customerRank: [],
			spRank: [],
			opRank: [],
			agencyRank: [],
			rank: [],
			moment: moment().format('HH:mm:ss'),
			number: 123,
			isShowSelect: false,
			hasInplay: true,

			total: {
				ended: 0,
				publish: 0,
				refund: 0,
				exception: 0,
				customers: 0,
				register: 0,
				abnormal: 0
			},

			tabs: DataMarketType.source,
			activeTab: localStorage.getItem('indoorActiveTab') ? localStorage.getItem('indoorActiveTab') : '10',
		}
		this.initAssort = {
			bet_amount: '-',
			bet_limit: '-',
			bet_limit_customer: '-',
			bet_status: 0,
			inplay_status: 0,
			high_win_profit: '-',
			max_paid: '-',
			max_profit: '-',
			orders: '-',
			total_limit_customer: '-',
		}
		this.thisDate = moment().format('YYYY-MM-DD');
		this.today = (new Date()).getTime()
		this.color = ['#007AFF', '#FF6600'];
		this.interval = 3000;
		this.isFirst = true;
		this.changeEvent = false;
	}

	componentWillMount() {
		this.timer = setInterval(this.handleMoment, 1000)
		const tabs = DataMarketType.source.filter(item => item.status == 1);
		this.state.tabs = tabs;

		this.getData();
	}

	componentWillUnmount() {
		clearInterval(this.timer)
		clearInterval(this.reloadTimer);
		clearInterval(this.reloadDetail);
		localStorage.removeItem('indoorActiveTab');
	}

	getData() {
		this.getEvent();
		this.getAgencyRank();
		this.getRank();
		this.getTotal();
		this.reloadTimer = setInterval(() => {
			this.getEvent();
			this.getAgencyRank();
			this.getRank();
			this.getTotal();
		}, this.interval)

		this.reloadDetail = setInterval(() => {
			this.getEventInfo();
			this.getCustomerRank();
			// this.getSpRank();
			this.getOpRank();
		}, this.interval)
	}

	getEventData() {
		this.getEventInfo();
		this.getCustomerRank();
		// this.getSpRank();
		this.getOpRank();
		this.reloadDetail = setInterval(() => {
			this.getEventInfo();
			this.getCustomerRank();
			// this.getSpRank();
			this.getOpRank();
		}, this.interval)
	}

	getEvent() {
		const json = {
			limit: 10,
			event_assort: this.state.activeTab
		}
		NetReport.getBoardEvent(json).then(res => {
			const data = res.data;
			let eventId = '';
			
			if (data && data.length) {
				data && data.length && data.map(item => {
					if (item.assort && item.assort.length == 1) {
						item.assort.push({
							is_inplay: 0,
							amount: 0,
							limit: 0,
							name: '滚盘'
						});
					}
				})
				eventId = this.state.activeId;
				if ((!eventId && this.isFirst) || !this.changeEvent) {
					this.state.activeEvent = data[0];
					this.state.activeId = data[0].event_id;
					eventId = data[0].event_id;
				}
				this.setState({
					event: data,
				});
			} else {
				this.setState({
					event: data,
					activeEvent: {},
					activeId: '',
				});
			}
			if (this.isFirst && eventId) {
				this.getEventInfo(eventId);
				this.getCustomerRank(eventId);
				// this.getSpRank(eventId);
				this.getOpRank(eventId);
				this.isFirst = false;
			}
		}).catch(err => {})
	}

	getEventInfo = (id) => {
		const json = {
			event_id: id || this.state.activeId,
		}
		NetReport.getBoardEventInfo(json).then(res => {
			let info = res.data;
			let hasInplay = true;
			if (info) {
				if (info.assort && info.assort.length == 1) {
					info.assort.push({
						...this.initAssort,
						name: '滚盘',
					});
					hasInplay = false;
				}
			} else {
				info = {};
				info.assort = [];
				for (let i = 0; i < 2; i++) {
					info.assort.push({
						...this.initAssort,
						name: i == 0 ? '早盘' : '滚盘',
					})
				}
			}
			this.setState({
				info,
				hasInplay
			});
		}).catch(err => {});
	}

	getCustomerRank = (id) => {
		const json = {
			event_id: id || this.state.activeId,
			limit: 20,
		}
		NetReport.getBoardCustomerRank(json).then(res => {
			const data = res.data;
			const initLen = data.length;
			if (initLen < 20) {
				for (let i = 0; i < 20 - initLen; i++) {
					data.push({
						nickname: '-',
						bet_op: '-',
						orders: '-',
						bet_amount: '-'
					})
				}
			}
			this.setState({
				customerRank: data,
			});
		}).catch(err => {});
	}

	getSpRank = (id) => {
		const json = {
			event_id: id || this.state.activeId,
			limit: 15,
		}
		NetReport.getBoardSpRank(json).then(res => {
			const data = res.data;
			const initLen = data.length;
			if (initLen < 15) {
				for (let i = 0; i < 15 - initLen; i++) {
					data.push({
						sp_name: '-',
						bet_amount: '-',
					})
				}
			}
			this.setState({
				spRank: data,
			});
		}).catch(err => {});
	}

	getOpRank(id) {
		const { activeTab, activeId } = this.state;
		if (!(id || activeId)) {
			let data = [];
			for (let i = 0; i < 15; i++) {
				data.push({
					sp_name: '-',
					op_name: '-',
					bet_amount: '-',
				})
			}
			this.setState({
				opRank: data,
			});
			return;
		}
		const json = {
			event_assort: Number(activeTab),
			event_id: id || activeId,
			data_type: 3, // 1机构 2客户 3竞猜选项
			lottery_status: 1,
		}
		NetReport.getLeagueDetailList(json).then(res => {
			const data = res.data.slice(0, 20).sort((prev, next) => {
				return next.bet_amount - prev.bet_amount;
			});
			data.map(item => {
				let name = item.name.split('-');
				item.sp_name = name[0];
				item.op_name = name[1];
			});
			const initLen = data.length;
			if (initLen < 15) {
				for (let i = 0; i < 15 - initLen; i++) {
					data.push({
						sp_name: '-',
						op_name: '-',
						bet_amount: '-',
					})
				}
			}
			this.setState({
				opRank: data,
			});
		}).catch(err => {});
	}

	getAgencyRank(id) {
		const { activeTab, activeId } = this.state;
		const json = {
			event_assort: localStorage.getItem('indoorActiveTab'),
			// event_id: id || activeId,
			date: this.thisDate,
			data_type: 1, // 1机构 2客户 3竞猜选项
			lottery_status: 1,
		}
		NetReport.getLeagueDetailList(json).then(res => {
			if (localStorage.getItem('indoorActiveTab') != json.event_assort) return;

			let data = res.data.filter(item => item._id != '0');
			data = data.sort((prev, next) => {
				return next.bet_amount - prev.bet_amount;
			});
			const initLen = data.length;
			if (initLen < 3) {
				for (let i = 0; i < 3 - initLen; i++) {
					data.push({
						name: '-',
						orders: '-',
						bet_amount: '-',
					})
				}
			}
			this.setState({
				agencyRank: data,
			});
		}).catch(err => {});
	}

	getRank = () => {
		const json = {
			limit: 20,
			event_assort: this.state.activeTab
		}
		NetReport.getBoardRank(json).then(res => {
			const data = res.data;
			const initLen = data.length;
			if (!data) data = [];
			if (initLen < 20) {
				for (let i = 0; i < 20 - initLen; i++) {
					data.push({
						nickname: '-',
						orders: '-',
						bet_amount: '-',
					})
				}
			}
			this.setState({
				rank: data,
			});
		}).catch(err => {});
	}

	getTotal() {
		const json = {
			event_assort: this.state.activeTab
		}
		NetReport.getBoardTotal(json).then(res => {
			Object.assign(this.state.total, res.data);
			this.setState({});
		}).catch(err => {})

		NetReport.getCustomerTotal().then(res => {
			Object.assign(this.state.total, res.data);
			this.setState({});
		}).catch(err => {})
	}

	handleMoment = () => {
		this.setState({
			moment: moment().format('HH:mm:ss'),
		})
	}

	handleEvent = (e) => {
		const id = e.currentTarget.dataset.id;
		const { activeId, event } = this.state

		if (id == activeId) return;
		// clearInterval(this.reloadTimer);
		clearInterval(this.reloadDetail);
		// this.reloadTimer = null;
		this.reloadDetail = null;
		this.changeEvent = true;

		this.setState({
			activeId: id,
			activeEvent: event.filter(item => item.event_id == id)[0],
		}, () => {
			this.getEventData();
		})
	}

	handleSelectShow = (e) => {
		e.stopPropagation();
		this.setState({
			isShowSelect: true,
		})
	}

	handleSelectHide = () => {
		this.setState({
			isShowSelect: false,
		})
	}

	handleChange = (e) => {
		const value = e.target.dataset.value;
		
		if (this.state.activeTab == value) {
			this.setState({
				isShowSelect: false,
			})
			return;
		}
		if (this.reloadTimer) {
			clearInterval(this.reloadTimer);
			this.reloadTimer = null;
		}
		if (this.reloadDetail) {
			clearInterval(this.reloadDetail);
			this.reloadDetail = null;
		}
		
		// this.reloadTimer = null;
		// this.reloadDetail = null;
		this.isFirst = true;
		localStorage.removeItem('indoorActiveTab');
		localStorage.setItem('indoorActiveTab', value);
		this.setState({
			activeId: '',
			activeTab: value,
			isShowSelect: false,
		}, () => {
			this.getData();
		});
	}

	renderEventStatus(event_status) { 
		switch (event_status) {
			case 0: return '未开始';
			case 1: return '即将开始';
			case 2: return '进行中';
			case 3: return '结束';
			case 4: return '取消';
			case 5: return '延期';
			case 6: return '中断';
			case 7: return '作废';
			case 8: return '报道丢失';
			case 9: return '未知';
			default: return '-';
		}
	}

	renderSettle(settle_status) {
		switch (settle_status) {
			case 0: return '未生成';
			case 1: return '已生成';
			default: return '-';
		}
	}

	renderLottery(lottery_status) {
		switch (lottery_status) {
			case 0: return '未派奖';
			case 1: return '派奖中';
			case 2: return '完成';
			case 3: return '失败';
			default: return '-';
		}
	}

	renderRisk(risk_level) {
		switch (risk_level) {
			case 1: return '极高';
			case 2: return '高';
			case 3: return '中';
			case 4: return '低';
			case 5: return '极低';
			default: return '-';
		}
	}

	renderRiskStyle(risk_level) {
		switch (risk_level) {
			case 1: return styles.red;
			case 2: return styles.orange;
			case 3: return styles.blue;
			case 4: return styles.green;
			case 5: return styles.lightGreen;
		}
	}

	eStop = (e) => {
		e.stopPropagation();
	}

	render() {
		const {
			event,
			activeId,
			activeEvent,
			info,
			customerRank,
			spRank,
			opRank,
			agencyRank,
			rank,
			moment,
			total,
			tabs,
			activeTab,
			isShowSelect,
			hasInplay
		} = this.state;
		const current = tabs.filter(item => item._id == activeTab)[0];

		return <div className={styles.screen} onClick={this.handleSelectHide}>
					<div className={classnames(styles.header, globalStyles.flexSb)}>
						<div className={globalStyles.flex}>
							聚水塔赛事数据中心 -&nbsp;<span className={styles.yellow}>{current.title}</span>赛事管控
							<div
								className={styles.triangle}
								onClick={this.handleSelectShow}
							>
								{isShowSelect ? (
									<div
										className={styles.select}
										onClick={this.eStop}
									>
										{tabs.map(item => <div
																className={styles.selectItem}
																value={item._id}
																data-value={item._id}
																key={item._id}
																onClick={this.handleChange}
															>{item.title}</div>)}
									</div>
								) : null}
							</div>
						</div>
						<span className={styles.time}>{moment}</span>
					</div>

					<div className={styles.main}>
						<div className={styles.left}>
							<div className={styles.title}>
								<div>当前赛事</div>
								<div className={styles.subTitle}>所有已投注且未结束的赛事</div>
							</div>
							<div className={styles.eventWrap}>
								{event && event.length ? event.map(item => (
									<div
										// key={item.event_id + activeEvent.event_id}
										key={item.event_id}
										data-id={item.event_id}
										onClick={this.handleEvent}
										className={classnames(
											styles.eventItem,
											globalStyles.flex,
											item.event_id == activeEvent.event_id ? styles.active : null,
											this.renderRiskStyle(item.risk_level)
										)}
									>
										<div className={classnames(styles.team, globalStyles.flex)}>
											<div className={classnames(styles.name, styles.alignRight)}>{item.teams[0].name}</div>
											<img src={item.teams[0].icon} alt="" />
											{item.event_status != undefined && item.event_status == 2 ? (
												<span className={classnames(styles.date, globalStyles.color999)}>进行中</span>
											) : (
												<span className={styles.date}>{item.begin_time_str}</span>
												
											)}
											<img src={item.teams[1].icon} alt="" />
											<div className={styles.name}>{item.teams[1].name}</div>
										</div>
										<div className={classnames(styles.chart, globalStyles.flex)}>
											{item.assort.map((a_item, index) => {
												if (a_item.is_inplay != 0) {
													return (
														<Progress
															key={index}
															width={60}
															type="circle"
															percent={a_item.limit ? (a_item.amount / a_item.limit) * 100 : 0}
															strokeColor={a_item.amount / a_item.limit >= 0.9 ? this.color[1] : this.color[0]}
															strokeLinecap="square"
															format={percent => <div className={styles.font12}>{a_item.name}</div>}
															style={{ marginRight: index ? 0 : 10 }}
														/>
													)
												}
												return null;
											})}
										</div>
									</div>
								)) : <Empty
										className={styles.noData}
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										imageStyle={{
											height: 30
										}}
										description={<span className={styles.white}>暂无数据</span>}
									/>}
							</div>
						</div>

						<div className={styles.middle}>
							<div className={styles.title}>
								{activeId ? (
									<div>{activeEvent.teams && activeEvent.teams[0].name} <span className={styles.blue}>vs</span> {activeEvent.teams && activeEvent.teams[1].name}</div>
								) : '-'}
								<div className={styles.subTitle}>
									{activeId ? (
										<Fragment>
											{info.league && info.league.name}
											<span className={styles.divider}>|</span>
											{DataGames.getField(info.game_id, 'name')}
											<span className={styles.divider}>|</span>
											{info.event_id}
											<span className={styles.divider}>|</span>
											BO{info.bo}
										</Fragment>
									) : '-'}
								</div>
							</div>
							<div className={styles.midContent}>
								<Row>
									<Col span={8}><span className={styles.labelColor}>比赛状态：</span>{this.renderEventStatus(info.event_status)}</Col>
									<Col span={8}><span className={styles.labelColor}>彩果状态：</span>{this.renderSettle(info.event_build_status)}</Col>
									<Col span={8}><span className={styles.labelColor}>派奖审核：</span>{this.renderLottery(info.event_check_status)}</Col>
									{/* <Col span={8}><span className={styles.labelColor}>比赛时间：</span>{info.begin_time}</Col> */}
									<Col span={8}><span className={styles.labelColor}>比赛时间：</span>{info.begin_time ? utils.formatDate(info.begin_time) : '-'}</Col>
									<Col span={8}><span className={styles.labelColor}>风险：</span>{this.renderRisk(info.risk_level)}</Col>
									<Col span={8}><span className={styles.labelColor}>等级：</span>{DataLeagueLevels.getLevel(info.level_id)}</Col>
								</Row>
								{info.assort && info.assort.map((item, index) => {
									if (item.inplay_status != 0) {
										return <div className={styles.box} key={index}>
													<div className={classnames(styles.boxTitle, globalStyles.flex)}>
														{item.name}竞猜
														<div
															className={classnames(styles.status, item.bet_status == 1 ? styles.active : null)}
														>{item.inplay_status == 0 ? '无' : (item.bet_status == 0 ? '封盘' : '开盘')}</div>
													</div>
													<Row>
														<Col span={4}>
															<div className={styles.labelColor}>订单总数</div>
															<div className={styles.font24}>
																{item.orders != '-' ? (
																	<AnimateNumber value={item.orders} fixed={0} />
																) : item.orders}
															</div>
														</Col>
														<Col span={5}>
															<div className={styles.labelColor}>投注总额</div>
															<div className={styles.font24}>
																{item.bet_amount != '-' ? (
																	<AnimateNumber value={item.bet_amount / 100} fixed={0} />
																) : item.bet_amount}
															</div>
														</Col>
														<Col span={5}>
															<div className={styles.labelColor}>最大亏损额</div>
															<div className={classnames(styles.font24, styles.red)}>
																{item.max_paid != '-' ? (
																	<AnimateNumber value={Math.abs(item.max_paid) / 100} prev={item.max_paid < 0 && Math.abs(item.max_paid) >= 100 ? '-' : null} fixed={0} />
																) : item.max_paid}
															</div>
														</Col>
														<Col span={5}>
															<div className={styles.labelColor}>最大盈利额</div>
															<div className={classnames(styles.font24, styles.green)}>
																{item.max_profit != '-' ? (
																	<AnimateNumber value={item.max_profit / 100} fixed={0} />
																) : item.max_profit}
															</div>
														</Col>
														<Col span={5}>
															<div className={styles.labelColor}>预计盈亏</div>
															<div className={classnames(styles.font24, item.high_win_profit < 0 ? styles.red : (item.high_win_profit > 0 ?styles.green : ''))}>
																{item.high_win_profit != '-' ? (
																	<AnimateNumber
																		value={Math.abs(item.high_win_profit) / 100}
																		prev={item.high_win_profit < 0 && Math.abs(item.max_paid) >= 100 ? '-' : null}
																		fixed={0}
																	/>
																) : item.high_win_profit}
															</div>
															
														</Col>
													</Row>
													<div className={styles.progress}>
														<span className={styles.mRight15}>本场投注上限：{item.bet_limit != '-' ? utils.formatMoney(item.bet_limit / 100, 0) : item.bet_limit}</span>
														<span className={styles.mRight15}>无归属客户（单笔投注上限：{item.bet_limit_customer != '-' ? utils.formatMoney(item.bet_limit_customer / 100, 0) : item.bet_limit_customer}</span>
														<span className={styles.mRight15}>本场投注上限：{item.total_limit_customer != '-' ? utils.formatMoney(item.total_limit_customer / 100, 0) : item.total_limit_customer}）</span>
													</div>
													<Progress
														percent={activeEvent.assort && activeEvent.assort[index].limit && (activeEvent.assort[index].amount / activeEvent.assort[index].limit) * 100}
														// percent={10}
														strokeColor={activeEvent.assort && activeEvent.assort[index].limit && activeEvent.assort[index].amount / activeEvent.assort[index].limit >= 0.9 ? this.color[1] : this.color[0]}
														// strokeColor={this.color[1]}
														strokeWidth={3}
														showInfo={false}
														className={styles.progressLine}
													/>
												</div>
									}
								})}
								<div className={classnames(styles.billWrap, hasInplay ? styles.hasInplay : null)}>
									<div className={styles.bLeft}>
										<div className={styles.billTitle}>本场客户竞猜排行</div>
										<div className={styles.billTable}>
											<div className={classnames(styles.tHead, globalStyles.flexSb)}>
												<div className={styles.tName}>客户</div>
												<div className={styles.tOption}>选项</div>
												<div className={styles.tOrder}>订单数</div>
												<div className={styles.tAmount}>投注额</div>
											</div>
											<div className={styles.tBody}>
												{customerRank && customerRank.length ? customerRank.map((item, index) => (
													<div className={globalStyles.flexSb} key={index + item.nickname}>
														<div className={styles.tName}>{item.nickname != '-' ? item.nickname : null}</div>
														<div className={styles.tOption}>{item.bet_op != '-' ? item.bet_op : null}</div>
														<div className={styles.tOrder}>{item.orders != '-' ? utils.formatMoney(item.orders, 0) : null}</div>
														<div className={styles.tAmount}>{item.bet_amount != '-' ? utils.formatMoney(item.bet_amount / 100, 0) : null}</div>
													</div>
												)) : null}
											</div>
										</div>
									</div>
									<div className={styles.bRight}>
										<div className={styles.billTitle}>本场盘口竞猜排行</div>
										<div className={styles.billTable}>
											<div className={classnames(styles.tHead, globalStyles.flexSb)}>
												<div>盘口</div>
												<div>投注额</div>
											</div>
											<div className={classnames(styles.tBody, styles.large)}>
												{opRank && opRank.length ? opRank.map((item, index) => (
													<div className={globalStyles.flexSb} key={index + item.sp_name}>
														<div className={styles.tPlate}>
															<div className={styles.font16}>{item.sp_name != '-' ? item.sp_name : null}</div>
															<div className={styles.font12s}>{item.op_name != '-' ? item.op_name : null}</div>
														</div>
														<div>{item.bet_amount != '-' ? utils.formatMoney(item.bet_amount / 100, 0) : null}</div>
													</div>
												)) : null}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className={styles.right}>
							<div className={styles.title}>
								<div>今日概况</div>
								<div className={styles.subTitle}>{utils.formatDate(this.today, 'YYYY年MM月DD日')}运营情况汇总</div>
							</div>
							<div className={styles.box} style={{ margin: 0 }}>
								<Row>
									<Col span={8}>
										<div className={styles.labelColor}>发布赛事</div>
										<div className={classnames(styles.font24, globalStyles.flex)}>
											{total.ended != '-' ? (
												<AnimateNumber value={total.ended} fixed={0} />
											) : total.ended}
											<span className={styles.font21}>/</span>
											{total.publish != '-' ? (
												<AnimateNumber value={total.publish} fixed={0} />
											) : total.publish}
										</div>
									</Col>
									<Col span={8}>
										<div className={styles.labelColor}>走盘赛事</div>
										<div className={styles.font24}>
											{total.refund != '-' ? (
												<AnimateNumber value={total.refund} fixed={0} />
											) : total.refund}
										</div>
									</Col>
									<Col span={8}>
										<div className={styles.labelColor}>异常赛事</div>
										<div className={styles.font24}>
											{total.exception != '-' ? (
												<AnimateNumber value={total.exception} fixed={0} />
											) : total.exception}
										</div>
									</Col>
									<Col span={8} style={{ marginTop: 15 }}>
										<div className={styles.labelColor}>新增客户</div>
										<div className={styles.font24}>
											{total.register != '-' ? (
												<AnimateNumber value={total.register} fixed={0} />
											) : total.register}
										</div>
									</Col>
									<Col span={8} style={{ marginTop: 15 }}>
										<div className={styles.labelColor}>投注客户</div>
										<div className={styles.font24}>
											{total.customers != '-' ? (
												<AnimateNumber value={total.customers} fixed={0} />
											) : total.customers}
										</div>
									</Col>
									<Col span={8} style={{ marginTop: 15 }}>
										<div className={styles.labelColor}>异常客户</div>
										<div className={classnames(styles.font24, styles.darkYellow)}>
											{total.abnormal != '-' ? (
												<AnimateNumber value={total.abnormal} fixed={0} />
											) : total.abnormal}
										</div>
									</Col>
								</Row>
							</div>

							<div className={classnames(styles.title, styles.mTop30)}>
								<div>机构排行</div>
							</div>
							<div className={classnames(styles.billTable, styles.rightAgency)}>
								<div className={classnames(styles.tHead, globalStyles.flexSb)}>
									<div className={styles.rName}>机构</div>
									<div className={styles.rOrder}>订单数</div>
									<div className={styles.rAmount}>投注额</div>
								</div>
								<div className={styles.tBody}>
									{agencyRank && agencyRank.length ? agencyRank.map((item, index) => (
										<div className={globalStyles.flexSb} key={index + item.name}>
											<div className={styles.rName}>{item.name != '-' ? item.name : null}</div>
											<div className={styles.rOrder}>{item.orders != '-' ? utils.formatMoney(item.orders.pre + item.orders.inplay, 0) : null}</div>
											<div className={styles.rAmount}>{item.bet_amount != '-' ? utils.formatMoney(item.bet_amount / 100, 0) : null}</div>
										</div>
									)) : null}
								</div>
							</div>

							<div className={classnames(styles.title, styles.mTop30)}>
								<div>竞猜排行</div>
								{/* <div className={styles.subTitle}>所有客户投注额（未派奖）排行</div> */}
							</div>
							<div className={classnames(styles.billTable, styles.rightBill)}>
								<div className={classnames(styles.tHead, globalStyles.flexSb)}>
									<div className={styles.rName}>客户</div>
									<div className={styles.rOrder}>订单数</div>
									<div className={styles.rAmount}>投注额</div>
								</div>
								<div className={styles.tBody}>
									{rank && rank.length && rank.map((item, index) => (
										<div className={globalStyles.flexSb} key={index + item.nickname}>
											<div className={styles.rName}>{item.nickname != '-' ? item.nickname : null}</div>
											<div className={styles.rOrder}>{item.orders != '-' ? utils.formatMoney(item.orders, 0) : null}</div>
											<div className={styles.rAmount}>{item.bet_amount != '-' ? utils.formatMoney(item.bet_amount / 100, 0) : null}</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
	}
}

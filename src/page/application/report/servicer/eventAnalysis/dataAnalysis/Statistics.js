import React, { Component, Fragment } from 'react';
import {
	Col,
	Row,
	Card,
	Divider,
	Progress,
	Statistic,
} from 'antd';
import classnames from 'classnames';
import utils from '@/utils';
import NetReport from '@/net/report';
import styles from '../../../styles.module.less'
import globalStyles from '@/resource/css/global.module.less';

const strokeColor = ['#1890FF', '#75BC74', '#FF0066', '#6633FF', '#0066CC', '#009999', '#999999'];

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			scan: {
				publish: 0,
				win: 0,
				loss: 0,
				exception: 0,
				refund: 0,
				ratio_win: 0,
				ratio_exception: 0,
			},
			bet: [],
			betTotal: [],
			risk: [],
		}
	}

	componentWillMount() {
		const { period, game_id, event_assort, time_type }  =this.props;
		this.getData({ period, game_id, event_assort, time_type });
	}

	componentWillReceiveProps(nextProps) {
		const props = this.props;
		const { period, game_id, event_assort, time_type } = nextProps;

		if (period == props.period && game_id == props.game_id && event_assort == props.event_assort && time_type == props.time_type) return;
		this.getData({ period, game_id, event_assort, time_type });
	}

	getData(json) {
		this.getTotal(json);
		this.getBet(json);
		this.getBetTotal(json);
		this.getRisk(json);
	}

	getTotal(json) {
		NetReport.getEventScan(json).then(res => {
			this.setState({
				scan: res.data,
			});
		}).catch(e => {})
	}

	getBet(json) {
		NetReport.getEventBet(json).then(res => {
			this.setState({
				bet: res.data,
			});
		}).catch(e => {})
	}

	getBetTotal(json) {
		NetReport.getEventBetTotal(json).then(res => {
			this.setState({
				betTotal: res.data,
			});
		}).catch(e => {})
	}

	getRisk(json) {
		NetReport.getEventRisk(json).then(res => {
			this.setState({
				risk: res.data,
			});
		}).catch(e => {})
	}

	format = percent => `${percent}%`

	render() {
		let { scan, bet, betTotal, risk } = this.state;
		let betSum = 0, betTotalSum = 0, riskSum = 0;
		let betArray = [], betTotalArray = [], riskArray = [];
		betSum = bet.reduce((pre, next) => pre + next, 0);
		betTotalSum = betTotal.reduce((pre, next) => pre + next, 0);
		riskSum = risk.reduce((pre, next) => pre + next, 0);

		betArray = bet.map(item => {
			if (betSum == 0) return 0;
			return item = Number((item / betSum * 100).toFixed(2))
		});

		betTotalArray =  betTotal.map(item => {
			if (betTotalSum == 0) return 0;
			return item = Number((item / betTotalSum * 100).toFixed(2))
		});

		riskArray = risk.map(item => {
			if (riskSum == 0) return 0
			return item = Number((item / riskSum * 100).toFixed(2))
		});

		return <Card bordered={false} title={null} className={globalStyles.mBottom16}>
					<Row className={styles.total} gutter={20}>
						<Col span={18}>
							<Row>
								<Col span={5}>
									<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
										<Statistic value={utils.formatMoney(scan.publish, 0)} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
										{/* <div className={styles.number}>{utils.formatMoney(scan.publish, 0)}</div> */}
										<div className={styles.tip}>发布赛事</div>
									</div>
								</Col>
								<Col span={5}>
									<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
										<Statistic value={utils.formatMoney(scan.win, 0)} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
										{/* <div className={styles.number}>{utils.formatMoney(scan.win, 0)}</div> */}
										<div className={styles.tip}>盈利赛事</div>
									</div>
								</Col>

								<Col span={5}>
									<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
										<Statistic value={utils.formatMoney(scan.loss, 0)} title="" precision={0} valueStyle={{ fontSize: '35px' }} />
										{/* <div className={classnames(styles.number)}>{utils.formatMoney(scan.loss, 0)}</div> */}
										<div className={styles.tip}>亏损赛事</div>
									</div>
								</Col>
								<Col span={5}>
									<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
										<Statistic
											value={utils.formatMoney(scan.exception, 0)}
											title=""
											precision={0}
											valueStyle={{ color: '#FA6603', fontSize: '35px' }}
										/>
										{/* <div className={classnames(styles.number, styles.orange)}>{utils.formatMoney(scan.exception, 0)}</div> */}
										<div className={styles.tip}>异常赛事</div>
									</div>
								</Col>
								<Col span={4}>
									<div className={classnames(globalStyles.flexCol, styles.totalItem)}>
										<Statistic
											value={utils.formatMoney(scan.refund, 0)}
											title=""
											precision={0}
											valueStyle={{ color: '#22996F', fontSize: '35px' }}
										/>
										{/* <div className={classnames(styles.number, styles.green)}>{utils.formatMoney(scan.refund, 0)}</div> */}
										<div className={styles.tip}>走盘赛事</div>
									</div>
								</Col>
							</Row>
						</Col>
						<Col span={6}>
							<Row>
								<Col span={12}>
									{/* <div className={styles.chartWrap}>
										<SmallPieChart />
									</div> */}
									<div className={globalStyles.flexCenter}>
										<Progress
											width={90}
											type="circle"
											percent={Number((scan.ratio_win / 100).toFixed(2))}
											strokeColor={strokeColor[1]}
											strokeLinecap="square"
											format={percent => <Fragment>
												<div className={styles.grassGreen}>{percent}<span className={styles.font12}>%</span></div>
												<div className={styles.font13}>盈利率</div>
											</Fragment>}
										/>
									</div>
								</Col>
								<Col span={12}>
									{/* <div className={styles.chartWrap}>
										<SmallPieChart color="orange" />
									</div> */}
									<div className={globalStyles.flexCenter}>
										<Progress
											width={90}
											type="circle"
											percent={Number((scan.ratio_exception / 100).toFixed(2))}
											strokeColor="#FA6603"
											strokeLinecap="square"
											format={percent => <Fragment>
												<div className={styles.orange}>{percent}<span className={styles.font12}>%</span></div>
												<div className={classnames(styles.font13, scan.ratio_exception / 100 >= 100 ? styles.orange : null)}>异常率</div>
											</Fragment>}
										/>
									</div>
								</Col>
							</Row>
						</Col>
					</Row>
					<Row gutter={20} style={{ marginTop: '16px' }}>
						<Col xxl={8} md={9} className={styles.colItem}>
							<div className={styles.midTitle}>投注次数</div>
							<div className={styles.progressWrap}>
								<Row>
									<Col xxl={6} lg={8}>
										小于50次
									</Col>
									<Col xxl={17} lg={15}>
										<Progress strokeColor={strokeColor[0]} percent={betArray[0]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} lg={8}>
										50次至100次
									</Col>
									<Col xxl={17} lg={15}>
										<Progress strokeColor={strokeColor[0]} percent={betArray[1]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} lg={8}>
										100次至200次
									</Col>
									<Col xxl={17} lg={15}>
										<Progress strokeColor={strokeColor[0]} percent={betArray[2]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} lg={8}>
										200次至300次
									</Col>
									<Col xxl={17} lg={15}>
										<Progress strokeColor={strokeColor[0]} percent={betArray[3]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} lg={8}>
										大于300次
									</Col>
									<Col xxl={17} lg={15}>
										<Progress strokeColor={strokeColor[0]} percent={betArray[4]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
							</div>
						</Col>
						
						<Col xxl={8} md={9} className={styles.colItem}>
							<div className={styles.midTitle}>投注金额(每单)</div>
							<div className={styles.progressWrap}>
								<Row>
									<Col xxl={6} md={8}>
										小于30元
									</Col>
									<Col xxl={17} md={15}>
										<Progress strokeColor={strokeColor[1]} percent={betTotalArray[0]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} md={8}>
										30元至200元
									</Col>
									<Col xxl={17} md={15}>
										<Progress strokeColor={strokeColor[1]} percent={betTotalArray[1]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} md={8}>
										200元至500元
									</Col>
									<Col xxl={17} md={15}>
										<Progress strokeColor={strokeColor[1]} percent={betTotalArray[2]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} md={8}>
										500元至2000元
									</Col>
									<Col xxl={17} md={15}>
										<Progress strokeColor={strokeColor[1]} percent={betTotalArray[3]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col xxl={6} md={8}>
										大于2000元
									</Col>
									<Col xxl={17} md={15}>
										<Progress strokeColor={strokeColor[1]} percent={betTotalArray[4]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
							</div>
						</Col>
						
						<Col xxl={8} md={6}>
							<div className={styles.midTitle}>风险等级</div>
							<div className={classnames(styles.progressWrap, styles.progressWrap2)}>
								<Row>
									<Col span={5}>
										极高
									</Col>
									<Col span={19}>
										<Progress strokeColor={strokeColor[2]} percent={riskArray[0]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col span={5}>
										高
									</Col>
									<Col span={19}>
										<Progress strokeColor={strokeColor[3]} percent={riskArray[1]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col span={5}>
										中
									</Col>
									<Col span={19}>
										<Progress strokeColor={strokeColor[4]} percent={riskArray[2]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col span={5}>
										低
									</Col>
									<Col span={19}>
										<Progress strokeColor={strokeColor[5]} percent={riskArray[3]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
								<Row>
									<Col span={5}>
										极低
									</Col>
									<Col span={19}>
										<Progress strokeColor={strokeColor[6]} percent={riskArray[4]} format={this.format} strokeWidth={6} />
									</Col>
								</Row>
							</div>
						</Col>
					</Row>
				</Card>
	}
}

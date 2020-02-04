import React, { Component, Fragment } from 'react';
import {
	message
} from 'antd';
import moment from 'moment';
import NetMarket from '@/net/market';
import styles from './styles.module.less';
import app from '@/resource/images/app.png';
import bg from '@/resource/images/Billboard3_pic_1.png';
import RQcode from '@/resource/images/Billboard3_pic_2.png';

import AnimateNumber from '@/component/animateNumber/Index';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			event_status: '',
			is_inplay_bet: '', //滚盘竞猜状态0.封盘、1.开盘
			is_inplay: '', //滚盘标记
			data: [],
			columnData: [],
			event_id: '',
			display: 1,
			oddsDetails_one: [],
			oddsDetails_two: []
		}
		this.columnData = [];	//柱状图数据
		this.isFirst = true;
		this.isOddFirst = true;
	}

	componentWillMount() {
		this.getData();

		this.dataTimer = setInterval(() => {
			this.getData();
		}, 1000)
		this.eventTimer = setInterval(() => {
			this.getEventInfo();
		}, 20000)
		this.oddsTimer = setInterval(() => {
			this.getEventOdds();
		}, 3000)
	}

	componentWillUnmount() {
		clearInterval(this.dataTimer);
		clearInterval(this.eventTimer);
		clearInterval(this.oddsTimer);
	}

	getData() {
		let data = {
			board_tag: '20191207'
		}
		NetMarket.getBillboard(data).then(res => {
			if (res.code == 200 && JSON.stringify(res.code.data) != '{}') {
				if (this.state.event_id != '' && res.data.event_id != this.state.event_id) {	//更换赛事清空柱状数据
					this.columnData = [];
				}
				this.setState({
					event_id: res.data.event_id,
					display: res.data.display
				}, () => {
					if (this.isFirst) {
						this.getEventInfo();
						this.isFirst = false;
					}
				});
			} else {
				this.setState({
					display: 0
				});
			}
		}).catch(err => {
			this.setState({
				display: 0
			});
		});
	}

	getEventInfo() {
		const { event_id } = this.state;
		if (!event_id) return;
		NetMarket.getEventInfo(event_id).then(data => {
			if (data.code == 200) {
				this.setState({
					event_status: data.data.event_status == 2 ? data.data.event_status : '',
					is_inplay_bet: data.data.is_inplay_bet,
					is_inplay: data.data.is_inplay
				}, () => {
					if (this.isOddFirst) {
						this.getEventOdds();
						this.isOddFirst = false;
					}
				})
			}
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getEventOdds() {
		if (this.state.display != 1) return;

		const { event_status, event_id, is_inplay_bet, is_inplay } = this.state;
		let assort;
		if (is_inplay_bet == 1 && is_inplay == 1 && event_status == 2) {
			assort = 1;
		} else {
			assort = 0
		}
		let data = {
			event_id: Number(event_id),
			assort: assort
		}
		NetMarket.getEventTrades(data).then(res => {
			let info = [];
			const rows = res.data.rows;
			if (rows && rows.length) {
				info.push(rows[0]);
				info.push(rows[1]);
				info.push(rows[2]);
				if (this.columnData.length < 18) {
					this.columnData.push(info);
				} else {
					this.columnData.shift();
					this.columnData.push(info);
				}
				this.setState({
					data: info
				})
				this.getOddsLogs(info[0]._id, 'red')
				this.getOddsLogs(info[1]._id, 'blue')
			} else {
				this.setState({
					display: 0
				});
			}
		}).catch(err => {
			this.setState({
				display: 0
			});
		});
	}

	getOddsLogs = (id, type) => {
		let data = {
			odds_id: id
		}
		NetMarket.getOddsLogs(data).then(res => {
			if (type == 'red') {
				this.setState({
					oddsDetails_one: res.data
				})
			} else if (type == 'blue') {
				this.setState({
					oddsDetails_two: res.data
				})
			}
		}).catch(err => {
			this.setState({
				display: 0
			});
		})
	}

	// 计算实时支持率方法
	supportCount = (odds_one, odds_two) => {
		const { data } = this.state;
		if (odds_one != undefined && odds_two != undefined) {
			let red_probability = (1 / (1 / (odds_one.odds) + 1 / (odds_two.odds))) / odds_one.odds,
				blue_probability = (1 / (1 / (odds_one.odds) + 1 / (odds_two.odds))) / odds_two.odds;
			return red_probability / (blue_probability + red_probability);
		}
	}

	domRender = (data, flag) => {
		const { oddsDetails_one, oddsDetails_two } = this.state;
		let oddsInfo_one = data.length > 0 ? data[0] : null,
			oddsInfo_two = data.length > 0 ? data[1] : null,
			odds_one = data.length > 0 ? (this.supportCount(oddsInfo_one, oddsInfo_two) * 100).toFixed(2) : '',
			odds_two = data.length > 0 ? (100 - odds_one).toFixed(2) : '';
		let columnData = [];
		let jackpotFlag;
		if (data.length > 0 && data[0].bet_mode == 1) {
			jackpotFlag = true;
		} else {
			jackpotFlag = false;
		}
		if (oddsDetails_one.length != 0 && oddsDetails_two.length != 0) {
			let len;
			if (oddsDetails_one.length > 18) {
				len = 16;	//最多显示16条
			} else {
				len = oddsDetails_one.length;
			}
			// 拼接红蓝数据数组
			for (var i = 0; i < len; i++) {
				columnData[i] = [];
				columnData[i].push(oddsDetails_one[i]);
				columnData[i].push(oddsDetails_two[i]);
			}
		}
		if (flag == 1) {
			return <Fragment>
				<div className={styles.title}>
					有奖竞猜实时数据
				</div>
				<div className={styles.content_top}>
					<div className={styles.amidithion} style={{ width: '50%' }}>{data.length > 0 ? oddsInfo_one.name : ''}</div>
					<div className={styles.amidithion} style={{ width: '50%', background: '#0055CA' }}>{data.length > 0 ? oddsInfo_two.name : ''}</div>
				</div>
				<div className={styles.content_bottom}>
					<div className={styles.odds_rd} style={{ width: '50%' }}>
						{data.length > 0 ? <AnimateNumber style={{ display: 'inline-block', lineHeight: '120px' }} value={oddsInfo_one.odds == 1 ? `${oddsInfo_one.odds}.01` : oddsInfo_one.odds} className={styles.animate_num_3} /> : ''}
					</div>
					{jackpotFlag ? (<div className={styles.jackpot}>奖池</div>) : null}
					<div className={styles.odds_rd} style={{ width: '50%', background: '#062C68' }}>
						{data.length > 0 ? <AnimateNumber style={{ display: 'inline-block', lineHeight: '120px' }} value={oddsInfo_two.odds == 1 ? `${oddsInfo_two.odds}.01` : oddsInfo_two.odds} className={styles.animate_num_3} /> : ''}
					</div>
				</div>
				<div className={styles.oddsCount}>
					<div className={styles.oddsCount_left}><span>{odds_one.split('.')[0]}.</span><span style={{ fontSize: '23px' }}>{odds_one.split('.')[1]}%</span></div>
					<div className={styles.oddsCount_center}>支持率</div>
					<div className={styles.oddsCount_right}><span>{odds_two.split('.')[0]}.</span><span style={{ fontSize: '23px' }}>{odds_two.split('.')[1]}%</span></div>
				</div>
				<div className={styles.ratioTr}>
					<div className={styles.ratioTr_red} style={{ width: `${odds_one}%`, background: '#CD0000' }}></div>
				</div>
				<div className={styles.oddsChart}>
					<span className={styles.chartLine}></span>
					<span className={styles.lineCount}>50<span style={{ fontSize: '16px' }}>%</span></span>
					<div>
						{columnData.reverse().map((item, index) => (
							<div className={styles.oddsColumn} key={index}>
								<div className={styles.column_top} style={{ background: '#CD0000' }}>
									<span style={{ height: `${70 - this.supportCount(item[0], item[1], item[2], 1) * 70}px`, background: '#000000' }}></span>
								</div>
								<div className={styles.column_bottom} style={{ background: '#000000' }}>
									<span style={{ height: `${(1 - this.supportCount(item[0], item[1], item[2], 1)) * 70}px`, background: '#0055CA' }}></span>
								</div>
							</div>
						))
						}
					</div>
				</div>
			</Fragment>
		} else if (flag == 0) {
			return <img src={bg} alt="" className={styles.Billboard3_bg} />
		} else if (flag == 2) {
			return <img src={RQcode} alt="" className={styles.Billboard3_bg} />
		}
	}

	render() {
		const { data, display } = this.state;
		return <div className={styles.body} style={{ background: '#000000' }}>
					<div className={styles.main_body}>
						<div id={styles.Billboard_rd}>
							{this.domRender(data, display)}
						</div>
					</div>
				</div>
	}
}

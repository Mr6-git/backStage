import React, { Component, Fragment } from 'react';
import {
	message
} from 'antd';
import NetMarket from '@/net/market';
import styles from './styles.module.less';

import app from '@/resource/images/app.png';
import logo from '@/resource/images/logo_1.png';
import paiqiu from '@/resource/images/paiqiu.png';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			event_status: '',
			is_inplay_bet: '', //滚盘竞猜状态0.封盘、1.开盘
			is_inplay: '', //滚盘标记
			data: [],
			event_id: '',
			display: 1
		}
		this.isFirst = true;
		this.isOddFirst = true;
	}

	componentWillMount() {
		this.getData();

		this.dataTimer = setInterval(()=>{
			this.getData();
		}, 1000)
		this.eventTimer = setInterval(()=>{
			this.getEventInfo();
		}, 20000)
		this.oddsTimer = setInterval(()=>{
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
			board_tag: '20191127'
		}
		NetMarket.getBillboard(data).then(res => {
			if (res.code == 200 && JSON.stringify(res.code.data) != '{}') {
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
		if(this.state.display != 1) return;

		const { event_status, event_id, is_inplay_bet, is_inplay } = this.state;
		let assort;
		if (is_inplay_bet == 1 && is_inplay == 1 && event_status ==2) {
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
				this.setState({
					data: info
				})
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

	domRender = (flag) => {
		const { data, display } = this.state;
		let oddsInfo_one = data.length > 0 ? data[0] : null,
			oddsInfo_two = data.length > 0 ? data[1] : null,
			odds_one = data.length > 0 ? (((1 / (1 / oddsInfo_one.odds + 1 / oddsInfo_two.odds)) / oddsInfo_one.odds) * 100).toFixed(2) : '',
			odds_two = data.length > 0 ? (100 - odds_one).toFixed(2) : '';

		const width = odds_one;
		if (flag == 1) {
			return <Fragment>
						<div className={styles.top}>
							<img src={app} alt="" className={styles.icons} />
						</div>
						<div className={styles.center}>
							<div className={styles.center_left}>
								{data.length > 0 ? oddsInfo_one.name : ''}
							</div>
							<div className={styles.center_right}>
								{data.length > 0 ? oddsInfo_two.name : ''}
							</div>
						</div>
						<div className={styles.odds}>
							<div className={styles.odds_left}>{odds_one}%</div>
							<h3>热度</h3>
							<div className={styles.odds_right}>{odds_two}%</div>
						</div>
						<div className={styles.ratio}>
							<div className={styles.ratio_red} style={{width: `${width}%`}}></div>
						</div>
					</Fragment>
		} else if (flag == 0) {
			return <img src={logo} alt="" className={styles.advertising} />
		} else if (flag == 2) {
			return <img src={paiqiu} alt="" className={styles.advertising_two} />
		}
	}

	render() {
		const { data, display} = this.state;
		return <div className={styles.body}>
					<div className={styles.main_body}>
						<div className={styles.main}>
							{this.domRender(display)}
						</div>
					</div>
				</div>
	}
}

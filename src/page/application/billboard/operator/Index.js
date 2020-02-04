import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Input,
	Slider,
	message,
	Progress,
	Popconfirm,
	InputNumber,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import DataGames from '@/data/Games';
import DataSpGroups from '@/data/SpGroup';
import DataMarketType from '@/data/MarketType';
import DataLeagueLevels from '@/data/LeagueLevels';
import NetReport from '@/net/report';
import NetMarket from '@/net/market';
import MyIcon from '@/component/MyIcon';
import styles from './styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

import EventEdit from '@/page/application/market/push/event/Edit';
import ResultEdit from '@/page/application/market/push/event/EditResult';
import AnimateNumber from '@/component/animateNumber/Index';

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			moment: moment().format('HH:mm:ss'),
			detail: {},
			info: {},
			lottery_status: 0, // 派奖状态
			boardTag: '20191207',
			display: 0,
			activeId: '34006',
			countObj: {}, // 分子计数
			mainProb: {}, // 主队胜率
			focusObj: {}, 

			bet_limit: 0,
			loss_limit: 0,
			bet_limit_inplay: 0,
			loss_limit_inplay: 0,
			bet_limit_customer: 0,
			total_limit_customer: 0,

			defaultActiveKey: 0, // 0早盘 1滚盘
			activeGroup: null,
			activeGroupIndex: 0,
			groupIdList: [],
			resultList: [], // 3级数组 [分组-玩法-选项]

			actual_profit: 0, // 早盘实际盈亏
			actual_profit_inplay: 0, // 滚盘实际盈亏

			spRisk: {}, // {id: { ...item }} 玩法风控
			spUpper: {},
			oddsUpper: {},
			lossUpper: {}, // 选项最大亏损
			lossRatio: {},
			probability: {},
			
			allowAdjust: false, // 允许自动调水
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
			customers: '-',
			total_limit_customer: '-',
		}
		this.color = ['#007AFF', '#FF6600'];
		this.betStatus = [
			{
				status: 1,
				title: '开盘',
			}, {
				status: 2,
				title: '暂停',
			}, {
				status: 0,
				title: '封盘'
			}
		]
		this.eventStatus = [
			{
				event_status: 2,// 进行中
				title: '开始' 
			}, {
				event_status: 3,
				title: '结束'
			}
		]
		this.number = [1, 2, 3, 4, 5, 6, 7, 8, 9]
		this.numberSimple = [1, 3, 5, 8, 10]
		this.interval = 3000;
		this.isFirst = true;
		this.isFirstLimit = true;
	}
	

	componentWillMount() {

		const id = this.props.match.params.eventId;
		this.state.activeId = id;
		
		this.getData(id);
		this.getControl();
		this.timer = setInterval(this.handleMoment, 1000)
		this.reloadTimer = setInterval(() => {
			this.getData(id);
			this.getBetLimit(id)
		}, this.interval)

	}

	componentWillUnmount() {
		clearInterval(this.timer)
		clearInterval(this.reloadTimer);
	}

	getData(id) {
		this.getEventInfo(id);
		this.getEventDetail(id);
		this.getAdjust(id);
		// this.getBetLimit(id);
		this.getOperator(id);
		this.getEventRisk(id);
	}

	getEventInfo = (id) => {
		const json = {
			event_id: id || this.state.info.event_id,
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
			}, () => {
				if (this.isFirstLimit) {
					this.getBetLimit();
					this.isFirstLimit = false;
				}
			});
		}).catch(err => {});
	}

	getEventDetail(id) {
		const eventId = id || this.state.info.event_id;
		NetMarket.getEventInfo(eventId).then(res => {
			this.setState({
				detail: res.data,
			})
			if (res.data.lottery_status == 2) {
				const key = [0, 1];
				key.map(item => {
					this.getTotalInfo(item)
				});
				clearInterval(this.reloadTimer);
			}
		}).catch(err => {
			message.error(err.msg)
		});
	}

	getEventRisk = (id) => {
		const { defaultActiveKey, info } = this.state;
		const isPre = defaultActiveKey == 0 ? 1 : 0;

		const data = {
			assort: Number(defaultActiveKey),
			is_pre_bet: isPre,
			event_id: id || info.event_id,
		};
		NetMarket.getRiskEventSp(data).then(res => {
			const spRisk = {};
			res.data.map(item => {
				spRisk[item.sp_id] = item
			})
			this.setState({
				spRisk,
			})
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	getAdjust(id) {
		const eventId = id || this.state.info.event_id;
		NetMarket.getEventAdjust(eventId).then(res => {
			const data = res.data;
			let allowAdjust = true;
			data.map(item => {
				if (item.virtual_pool <= 0 || item.lever <= 0 || item.max_odds <= 0 || item.pump <= 0) {
					allowAdjust = false;
				}
			});
			this.setState({
				allowAdjust: allowAdjust
			})
		}).catch(err => {});
	}

	getBetLimit = (id) => {
		const { info } = this.state;

		const json = {
			event_id: id || info.event_id,
			event_assort: info.event_assort,
			level_id: info.level_id,
			risk_level: info.risk_level,
		}
		NetMarket.getRiskEventInfo(json).then(res => {
			this.setState({
				...res.data
			})
		}).catch(err => {})
	}

	getOperator = (id) => {
		const { defaultActiveKey } = this.state;
		const data = {
			event_id: id || this.state.activeId,
			assort: defaultActiveKey,
		};
		NetMarket.getEventTrades(data).then(res => {
			const groupList = this.handleData(res.data.rows, 'group_id');
			const resultList = groupList.map(item => this.handleData(item, 'sp_id'));
			const mainProb = {};
			for (let i = 0; i < resultList.length; i++) {
				const groupItem = resultList[i];
				for (let j = 0; j < groupItem.length; j++) {
					const spItem = groupItem[j];
					mainProb[spItem[0].sp_id] = Number((spItem[0].probability * 100).toFixed(2));
				}
			}
			if (this.isFirst) {
				this.state.mainProb = mainProb;
				this.isFirst = false;
			}
			this.setState({
				resultList,
				totalInfo: res.data.total,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getTotalInfo(defaultActiveKey) {
		const data = {
			event_id: this.state.activeId,
			assort: defaultActiveKey,
		};
		NetMarket.getEventTrades(data).then(res => {
			const total = res.data.total;
			switch (defaultActiveKey) {
				case 0: this.state.actual_profit = total.actual_profit; break;
				case 1: this.state.actual_profit_inplay = total.actual_profit_inplay; break;
			}
			this.setState({});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getControl() {
		const { boardTag } = this.state;
		const json = {
			board_tag: boardTag
		};
		NetMarket.getBillboard(json).then(res => {
			const data = res.data;
			this.setState({
				display: data.display
			});
		}).catch(err => {
			this.setState({
				display: 0
			});
		});
	}

	handleData(data, key = 'group_id') {
		if (!data || !data.length) return;
		let newArr = [],
			tempArr = [],
			groupIdList = [];
		let countObj = {};
		for(let i = 0, j = data.length; i < j; i++){
			const item = data[i];
			countObj[item.sp_id] = 0;
			item.probability = Number((item.loss_ratio / item.odds).toFixed(4));
			// item.probability = Number(utils.toFixed(item.loss_ratio / item.odds, 4));

			if(data[i + 1] && data[i][key] == data[i + 1][key]){
				tempArr.push(data[i]);
			} else {
				if (key == 'group_id') {
					groupIdList.push(data[i][key]);
				}
				tempArr.push(data[i]);
				newArr.push(tempArr.slice(0));
				tempArr.length = 0;
			}
		}
		let activeGroup = this.state.activeGroup;
		if (this.isFirst) {
			activeGroup = groupIdList[0];
			// this.isFirst = false;
			if (key == 'group_id') {
				this.state.countObj = countObj;
			}
		}
		if (key == 'group_id') {
			this.setState({
				groupIdList,
				activeGroup,
			});
		}
		return newArr;
	}

	commit = () => {
		const {
			info,
			bet_limit,
			loss_limit,
			bet_limit_inplay,
			loss_limit_inplay,
			bet_limit_customer,
			total_limit_customer,
		} = this.state;

		const json = {
			bet_limit,
			loss_limit,
			bet_limit_inplay,
			loss_limit_inplay,
			bet_limit_customer,
			total_limit_customer,
		}
		NetMarket.updateRiskEventInfo(info.event_id, json).then((res) => {
			message.success('保存成功');
			this.getBetLimit();
			this.getEventInfo();
		}).catch((e) => {
			message.error(e.msg);
		});
	}

	handleMoment = () => {
		this.setState({
			moment: moment().format('HH:mm:ss'),
		})
	}

	pictureShow = () => {
		const { info, boardTag } = this.state;
		let json = {
			board_tag: boardTag,
			event_id: Number(info.event_id),
			display: 1,
			timeout: 86400
		}
		NetMarket.setBillboard(json).then(res => {
			message.success('操作成功');
			this.getControl()
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	pictureHide = (e) => {
		const flag = e.currentTarget.dataset.flag;
		const { info, boardTag } = this.state;
		let data = {
			board_tag: boardTag,
			event_id: Number(info.event_id),
			display: Number(flag),
			timeout: 86400
		}
		NetMarket.setBillboard(data).then(res => {
			message.success('操作成功');
			this.getControl()
		}).catch(err => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		})
	}

	startEventBet = () => {
		const { defaultActiveKey, info } = this.state;
		const json = {
			assort: defaultActiveKey,
		}
		NetMarket.openBet(info.event_id, json).then((res) => {
			message.success(`开启${defaultActiveKey == 0 ? '早盘' : '滚盘'}成功`);
			this.getOperator();
			this.getEventInfo();
			this.getEventDetail();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	stopBetAll = () => {
		const { defaultActiveKey, info } = this.state;
		const json = {
			event_id: info.event_id + '',
			assort: defaultActiveKey,
		}
		NetMarket.stopBetAll(json).then(res => {
			message.success('操作成功');
			this.getOperator();
			this.getEventInfo();
			this.getEventDetail();
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	closeEventBet = () => {
		const { defaultActiveKey, info } = this.state;
		const json = {
			assort: defaultActiveKey,
		}
		NetMarket.closeBet(info.event_id, json).then((res) => {
			message.success(`关闭${defaultActiveKey == 0 ? '早盘' : '滚盘'}成功`);
			this.getOperator();
			this.getEventInfo();
			this.getEventDetail();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		})
	}

	editEventStatus(status) {
		const json = {
			status: status + '',
			reason: '修改赛事状态'
		}
		NetMarket.editMatch(this.state.info.event_id, json).then((res) => {
			message.success('编辑成功');
			this.getEventInfo();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	editBetStatus = (type, data) => {

		let param = null;
		const { defaultActiveKey, info } = this.state;
		const json = {
			assort: defaultActiveKey,
			event_id: info.event_id,
			sp_id: data[0].sp_id + ''
		};

		switch (type) {
			case 0: param = 'close_bet'; break; // 封盘
			case 1: param = 'open_bet'; break; // 开盘
			case 2: param = 'suspend_bet'; break; // 暂停
		}

		NetMarket.openOrCloseBetBatch(json, param).then((res) => {
			message.success('操作成功');
			this.getOperator();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	editOptionBetStatus = (type, data) => {

		let param = null;
		const { defaultActiveKey, info } = this.state;
		const json = {
			assort: defaultActiveKey,
			event_id: info.event_id,
			op_id: data.op_id + ''
		};

		switch (type) {
			case 0: param = 'close_bet'; break; // 封盘
			case 1: param = 'open_bet'; break; // 开盘
			case 2: param = 'suspend_bet'; break; // 暂停
		}

		NetMarket.openOrCloseOptionBet(json, param).then((res) => {
			message.success('操作成功');
			this.getOperator();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	editAllowBotAdjust = (data) => {
		const { defaultActiveKey, info } = this.state;
		const json = {
			assort: defaultActiveKey,
			event_id: info.event_id,
			sp_id: data[0].sp_id + ''
		};
		let param = !data[0].allow_bot_adjust ? 'open_adjust' : 'close_adjust';
		NetMarket.openOrCloseAllowAdjust(json, param).then((res) => {
			message.success(`${!data[0].allow_bot_adjust ? '开启自动调水' : '关闭自动调水'}`);
			this.getOperator();
			this.getAdjust();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	editOdds = (data) => {
		const { oddsUpper, spUpper, lossUpper, info, defaultActiveKey } = this.state;

		const json = {
			event_id: Number(info.event_id),
			assort: defaultActiveKey,
			sp_id: data.sp_id,
			threshold_ratio: data.threshold_ratio,
			loss_upper: lossUpper[data.op_id] ? Number(lossUpper[data.op_id]) * 100 : data.loss_upper,
			sp_upper: spUpper[data.op_id] ? Number(spUpper[data.op_id]) * 100 : data.sp_upper,
			odds_upper: oddsUpper[data.op_id] ? Number(oddsUpper[data.op_id]) * 100 : data.odds_upper,
		}
		NetMarket.updateRiskEventSp(json).then((res) => {
			message.success('编辑成功');
			this.getEventRisk();
		}).catch(e => {
			message.error(e.msg);
		});
	}

	editEvent = () => {
		const options = {
			title: '编辑赛事信息',
			width: 550,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false
		}
		Event.emit('OpenModule', {
			module: <EventEdit
						{...this.state.info}
						okCallback={this.getEventInfo}
					/>,
			props: options,
			parent: this
		});
	}

	editResult = (data) => {
		const options = {
			title: '编辑赛果',
			width: 500,
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false
		}
		Event.emit('OpenModule', {
			module: <ResultEdit
						{...this.state.info}
						okCallback={this.getEventInfo}
					/>,
			props: options,
			parent: this
		});
	}

	editLossRatio(data) {
		const { lossRatio, defaultActiveKey, info } = this.state;
		const loss_ratio = lossRatio[data[0].sp_id];
		if (!loss_ratio) {
			message.success('操作成功');
			return;
		}
		data.map(item => {
			const odds = (loss_ratio / 100 / item.probability / item.ratio * 100.00).toFixed(2);
			this.postOdds(odds, item, defaultActiveKey, info)
		})
	}

	editProbability(data, probabilityArg) {
		const { probability, defaultActiveKey, info } = this.state;
		const probabilityObj = probabilityArg || probability;
		let probability_rate = probabilityObj[data[0].sp_id];
	
		if (!probability_rate) {
			message.success('操作成功');
			return;
		}
		if (probability_rate.length) {
			probability_rate.push((100 - probability_rate[0] - probability_rate[1]).toFixed(2));
		} else {
			let temp = probability_rate;
			probability_rate = [];
			probability_rate.push(temp);
			probability_rate.push((100 - temp).toFixed(2));
		}
		data.map((item, index) => {
			let _probability = probability_rate;
			if (probability_rate.length) {
				_probability = probability_rate[index]
			}
			const odds = (item.loss_ratio / Number(_probability) * 100 / item.ratio * 100.00).toFixed(2);
			this.postOdds(odds, item, defaultActiveKey, info)
		})
	}

	postOdds(odds, item, defaultActiveKey, info) {
		const json = {
			assort: defaultActiveKey,
			sp_id: item.sp_id,
			op_id: item.op_id,
			odds: Number(odds)
		}
		NetMarket.editSp(info.event_id, json).then((res) => {
			this.state.probability = {};
			this.state.mainProb = {};
			this.isFirst = true;
			this.getOperator();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	handleChange = (value, key) => {
		this.state[key] = Number(value) * 100;
	}

	handleKey = e => {
		const key = Number(e.currentTarget.dataset.key);
		if (key == this.state.defaultActiveKey) return;
		this.setState({
			defaultActiveKey: key,
		}, () => {
			this.getOperator();
			this.getEventRisk();
		})
	}

	handleGroup = (e) => {
		const dataset = e.currentTarget.dataset;
		const group = dataset.group;
		const index = dataset.index;
		if (group == this.state.activeGroup) return;
		this.setState({
			activeGroup: group,
			activeGroupIndex: index,
		});
	}

	handleChangeSp(ratio, data) {
		const spUpper = {};
		spUpper[data.op_id] = ratio;
		this.setState({
			spUpper
		});
	}

	handleChangeOdds(ratio, data) {
		const oddsUpper = {};
		oddsUpper[data.op_id] = ratio;
		this.setState({
			oddsUpper
		});
	}
	
	handleChangeLoss(ratio, data) {
		const lossUpper = {};
		lossUpper[data.op_id] = ratio;
		this.setState({
			lossUpper
		});
	}

	handleProbability(_value, data) {
		let value = _value;
		const probability = {};
		if (_value.length) {
			const temp = [];
			const sec = Number(( _value[1] - _value[0]).toFixed(2));
			temp.push(_value[0])
			temp.push(sec)
			value = temp;
		}
		probability[data.sp_id] = value;
		this.setState({
			probability
		});
	}

	handleLossRatio(e, data) {
		const value = Number(e.currentTarget.value);
		if (isNaN(value)) return;
		
		const lossRatio = {};
		lossRatio[data.sp_id] = value;
		this.setState({
			lossRatio
		});
	}

	handleNumber(data, value) {
		const { countObj } = this.state;
		const probability = {};
		probability[data[0].sp_id] = Number((Number(value) * 10 + countObj[data[0].sp_id]).toFixed(2));
		this.editProbability(data, probability)
	}

	handleNumberAdd(data, value) {
		const probability = {};
		probability[data[0].sp_id] = Number((data[0].probability * 100 + Number(value)).toFixed(2));
		this.editProbability(data, probability)
	}

	handleNumberMinus(data, value) {
		const probability = {};
		if (data[0].probability * 100 - Number(value) < 10) {
			message.warning('概率不得小于10');
			return;
		}
		probability[data[0].sp_id] = Number((data[0].probability * 100 - Number(value)).toFixed(2));
		this.editProbability(data, probability)
	}

	handleMainProb = (data, e) => {
		let mainProb = this.state.mainProb;
		const value = e.target.value;
		if (Number(value) < 10) {
			// message.warning('概率不得小于10');
			return;
		}
		mainProb[data[0].sp_id] = Number(value);
		this.setState({
			mainProb
		});
	}

	handleMainProbBlur = (data, e) => {
		let mainProb = this.state.mainProb;
		const value = e.target.value;
		if (!value) {
			mainProb[data[0].sp_id] = Number((data[0].probability * 100).toFixed(2))
			this.setState({
				mainProb
			});
		}
	}

	handleAdd = (spId) => {
		const { countObj } = this.state;
		if (countObj[spId] >= 9) return;
		countObj[spId] = countObj[spId] + 1;
		this.setState({});
	}

	handleMinus = (spId) => {
		const { countObj } = this.state;
		if (countObj[spId] <= 0) return;
		countObj[spId] = countObj[spId] - 1;
		this.setState({});
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

	renderUpper(data, key) {
		if (data[key] == 0) {
			return data[`${key}_default`] / 100;
		}
		return data[key] / 100;
	}

	renderUpperPop(data) {
		if (!data) return;
		const spRatio = data.sp_upper / 100;
		const oddsRatio = data.odds_upper / 100;
		return (
			<Fragment>
				<div style={{ marginLeft: -20 }}>
					玩法投注上限：
					<InputNumber
						min={1}
						defaultValue={spRatio ? spRatio : null}
						step={1}
						onChange={(value) => { this.handleChangeSp(value, data) }}
						style={{ width: 120 }}
					/>
				</div>
				<div style={{ margin: '10px 0 0 -20px' }}>
					选项投注上限：
					<InputNumber
						min={1}
						defaultValue={oddsRatio ? oddsRatio : null}
						step={1}
						onChange={(value) => { this.handleChangeOdds(value, data) }}
						style={{ width: 120 }}
					/>
				</div>
				<div style={{ margin: '10px 0 0 -20px' }}>
					选项最大亏损：
					<InputNumber
						min={0}
						defaultValue={data.loss_upper ? data.loss_upper / 100 : null}
						step={1}
						onChange={(value) => { this.handleChangeLoss(value, data) }}
						style={{ width: 120 }}
					/>
				</div>
			</Fragment>
		)
	}

	renderWidth(data) {
		const { spRisk } = this.state;
		const riskItem = spRisk[data[0].sp_id];
		if (!riskItem) return;
		const sp_upper = riskItem.sp_upper;
		let amount = 0;
		data.map(item => {
			amount = item.amount + amount;
		})

		if (sp_upper == 0 || amount == 0) {
			return 0;
		}

		return amount / sp_upper < 0.01 ? '1%' : ((amount / sp_upper) * 100).toFixed(2) + '%'
	}

	renderSlider(data, is_bet, is_build) {
		if (!data || !data.length) return null;
		switch(data.length) {
			case 2: return <Slider
								defaultValue={Number(data[0].probability * 100)}
								step={1}
								key={Number(data[0].probability * 100)}
								onChange={value => { this.handleProbability(value, data[0]) }}
								disabled={!is_build || !is_bet || !!data[0].allow_bot_adjust}
							/>;
			case 3: {
				const val1 = Number((data[0].probability * 100).toFixed(2));
				const val2 = Number((data[1].probability * 100).toFixed(2));
				return <Slider
								range
								defaultValue={[val1, Number((val1 + val2).toFixed(2))]}
								step={1}
								key={[val1, Number((val1 + val2).toFixed(2))]}
								onChange={value => { this.handleProbability(value, data[0]) }}
								disabled={!is_build || !is_bet || !!data[0].allow_bot_adjust}
							/>;
			}
			default: return <Slider defaultValue={0} disabled key={data[0].op_id} />
		}
	}

	renderRate(num) {
		if (num < 0.01) {
			return 0.01
		}
		return num;
	}

	isSliderChange(item, probability, isHandred) {
		switch (item.length) {
			case 2: {
				let itemProb = item[0].probability;
				if (isHandred) {
					itemProb = Number((itemProb * 100).toFixed(2));
				}
				if (probability[item[0].sp_id] != undefined && probability[item[0].sp_id] != itemProb) {
					return true;
				}
				return false;
			}
			case 3: {
				if ((probability[item[0].sp_id] != undefined && probability[item[0].sp_id] != item[0].probability) || (probability[item[1].sp_id] != undefined && probability[item[1].sp_id] != item[1].probability)) {
					return true;
				}
				return false;
			}
			default: return false;
		}
	}

	eStop = (e) => {
		e.stopPropagation();
	}

	render() {
		const {
			moment,
			detail,
			actual_profit,
			actual_profit_inplay,
			display,
			activeId,
			info,
			countObj,
			defaultActiveKey,
			groupIdList,
			activeGroup,
			activeGroupIndex,
			resultList,
			spRisk,
			allowAdjust,
			probability,
			mainProb,
			focusObj,
		} = this.state;
		const _data = resultList && resultList.length ? resultList[activeGroupIndex] : [];

		let is_bet_play = false;
		if (defaultActiveKey == 0 && detail.event_status < 2) {
			is_bet_play = true;
		} else if (defaultActiveKey == 1 && detail.event_status < 3) {
			is_bet_play = true;
		}

		// let is_bet = false;
		// if (defaultActiveKey == 0 && info.assort && info.assort[0].bet_status) {
		// 	is_bet = true;
		// } else if (defaultActiveKey == 1 && info.assort && info.assort[1].bet_status) {
		// 	is_bet = true;
		// }

		// 赛事异常
		const is_exception = !(detail.is_exception == 0 && detail.event_status <= 3);
		const isDisabledBet = (detail.is_bet == 0 && is_exception) || (detail.is_bet == 0 && (detail.settle_status == 1 || detail.event_status >= 2))
		const isDisabledInplay = detail.is_inplay == 0;

		let actProfit = actual_profit ? actual_profit / 100 : 0;
		if (isNaN(actProfit)) {
			actProfit = 0;
		}
		let actProfitInplay = actual_profit_inplay ? actual_profit_inplay / 100 : 0;
		if (isNaN(actProfitInplay)) {
			actProfit = 0;
		}

		let actProfitColor = '';
		if (actProfit < 0) {
			actProfitColor = styles.red;
		} else if (actProfit > 0) {
			actProfitColor = styles.green;
		}
		let actProfitInplayColor = '';
		if (actProfitInplay < 0) {
			actProfitInplayColor = styles.red;
		} else if (actProfitInplay > 0) {
			actProfitInplayColor = styles.green;
		}
		
		const actProfitList = [actProfit, actProfitInplay]
		const actProfitColorList = [actProfitColor, actProfitInplayColor]

		let is_build = false;
		if (detail.source && detail.source._id == '100') {
			is_build = true;
		}

		return <div className={styles.screen} onClick={this.handleSelectHide}>
					<div className={classnames(styles.header, globalStyles.flexSb)}>
						<div className={globalStyles.flex}>
							聚水塔赛事数据中心 -&nbsp;赛事操盘
						</div>
						<span className={styles.time}>{moment}</span>
					</div>

					<div className={styles.main}>
						<div className={styles.left}>
							<div className={classnames(styles.title, styles.mBottom5, styles.font30)}>
								<div>{info.teams && info.teams[0].name} <span className={styles.blue}>vs</span> {info.teams && info.teams[1].name}</div>
								<div className={classnames(styles.subTitle, globalStyles.flex)}>
									{activeId ? (
										<Fragment>
											<span className={styles.eventName}>{info.league && info.league.name}</span>
											<span className={styles.divider}>|</span>
											{DataGames.getField(info.game_id, 'name')}
											<span className={styles.divider}>|</span>
											{info.event_id}
											<span className={styles.divider}>|</span>
											BO{info.bo}
										</Fragment>
									) : '-'}
									<Icon
										type='edit'
										style={{ marginLeft: 10, fontSize: '14px', cursor: 'pointer' }}
										onClick={this.editEvent}
									/>
								</div>
							</div>

							<Row className={styles.descriptions}>
								<Col span={12}><span className={styles.labelColor}>比赛状态：</span>{this.renderEventStatus(info.event_status)}</Col>
								<Col span={12}><span className={styles.labelColor}>彩果状态：</span>{this.renderSettle(info.event_build_status)}</Col>
								<Col span={12}><span className={styles.labelColor}>比赛时间：</span>{info.begin_time ? utils.formatDate(info.begin_time) : '-'}</Col>
								<Col span={12}><span className={styles.labelColor}>风险：</span>{this.renderRisk(info.risk_level)}</Col>
								<Col span={12}><span className={styles.labelColor}>派奖审核：</span>{this.renderLottery(info.event_check_status)}</Col>
								<Col span={12}><span className={styles.labelColor}>等级：</span>{DataLeagueLevels.getLevel(info.level_id)}</Col>
							</Row>

							{info.assort && info.assort.map((item, index) => {
								if (item.inplay_status != 0) {
									return <div
												className={classnames(styles.box, defaultActiveKey == index ? styles.active : null)}
												key={index}
												data-key={index}
												onClick={this.handleKey}
											>
												<div className={classnames(styles.boxTitle, globalStyles.flex)}>
													{item.name}竞猜
													<div
														className={classnames(styles.status, item.bet_status == 1 ? styles.active : null)}
													>{item.inplay_status == 0 ? '无' : (item.bet_status == 0 ? '封盘' : '开盘')}</div>
												</div>
												<Row>
													<Col span={8}>
														<div className={styles.labelColor}>订单总数</div>
														<div className={styles.font24}>
															{item.orders && item.orders != '-' ? (
																<AnimateNumber value={item.orders} fixed={0} />
															) : item.orders}
														</div>
													</Col>
													<Col span={8}>
														<div className={styles.labelColor}>投注人数</div>
														<div className={styles.font24}>
															{item.customers && item.customers != '-' ? (
																<AnimateNumber value={item.customers} fixed={0} />
															) : item.customers}
														</div>
													</Col>
													<Col span={8}>
														<div className={styles.labelColor}>投注总额</div>
														<div className={styles.font24}>
															{item.bet_amount && item.bet_amount != '-' ? (
																<AnimateNumber value={item.bet_amount / 100} fixed={0} />
															) : item.bet_amount}
														</div>
													</Col>
													{detail.lottery_status == 2 ? (
														<Fragment>
															<Col span={8}>
																<div className={styles.labelColor}>实际盈亏</div>
																<div className={classnames(styles.font24, actProfitColorList[index])}>
																	{actProfitList[index] && actProfitList[index] != '-' ? (
																		<AnimateNumber value={Math.abs(Math.floor(actProfitList[index]))} prev={actProfitList[index] < 0 && Math.abs(Math.floor(actProfitList[index])) >= 100 ? '-' : null} />
																	) : actProfitList[index]}
																</div>
															</Col>
														</Fragment>
													) : (
														<Fragment>
															<Col span={8}>
													<div className={styles.labelColor}>最大亏损额</div>
																<div className={classnames(styles.font24, styles.red)}>
																	{item.max_paid && item.max_paid != '-' ? (
																		<AnimateNumber value={Math.abs(Math.floor(item.max_paid) / 100)} prev={item.max_paid < 0 && Math.abs(Math.floor(item.max_paid)) >= 100 ? '-' : null} fixed={0} />
																	) : item.max_paid}
																</div>
															</Col>
															<Col span={8}>
																<div className={styles.labelColor}>最大盈利额</div>
																<div className={classnames(styles.font24, styles.green)}>
																	{item.max_profit && item.max_profit != '-' ? (
																		<AnimateNumber value={item.max_profit / 100} fixed={0} />
																	) : item.max_profit}
																</div>
															</Col>
															<Col span={8}>
																<div className={styles.labelColor}>预计盈亏</div>
																<div className={classnames(styles.font24, item.high_win_profit < 0 ? styles.red : (item.high_win_profit > 0 ? styles.green : ''))}>
																	{item.high_win_profit && item.high_win_profit != '-' ? (
																		<AnimateNumber
																			value={Math.abs(Math.floor(item.high_win_profit) / 100)}
																			prev={item.high_win_profit < 0 && Math.abs(Math.floor(item.max_paid)) >= 100 ? '-' : null}
																			fixed={0}
																		/>
																	) : item.high_win_profit}
																</div>
															</Col>
														</Fragment>
													)}
												</Row>
												<div className={styles.progress} onClick={this.eStop}>
													<span className={styles.mRight15}>
														已投注 / 本场投注上限：
														{item.bet_limit != '-' ? utils.formatMoney(item.bet_limit / 100, 0) : item.bet_limit}
														<Popconfirm
															title={
																<div style={{ marginLeft: -20 }}>
																	投注额上限：
																	<InputNumber
																		min={1}
																		defaultValue={item.bet_limit ? item.bet_limit / 100 : null}
																		step={1}
																		style={{ width: 120 }}
																		onChange={(value) => { this.handleChange(value, index == 0 ? 'bet_limit' : 'bet_limit_inplay') }}
																	/> 
																</div>
															}
															onConfirm={this.commit}
															okText="确定"
															cancelText="取消"
															icon=""
														>
															<Icon type="edit" style={{ marginLeft: 10, fontSize: '14px' }} onClick={this.eStop} />
														</Popconfirm>
													</span>
												</div>
												<Progress
													percent={item.bet_limit && item.bet_limit != '-' && (item.bet_amount / item.bet_limit) * 100}
													// percent={10}
													strokeColor={item.bet_limit && item.bet_limit != '-' && item.bet_amount / item.bet_limit >= 0.9 ? this.color[1] : this.color[0]}
													// strokeColor={this.color[1]}
													strokeWidth={3}
													showInfo={false}
													className={styles.progressLine}
												/>
											</div>
								}
							})}
							<div className={classnames(styles.title, styles.mTop20)}>
								<div>投屏切换</div>
								<div className={styles.subTitle}>室外投屏内容切换开关</div>
							</div>
							<div className={styles.tabWrap}>
								<div className={classnames(globalStyles.flex, styles.tab)}>
									<div className={classnames(globalStyles.flexCenter, display == 1 ? styles.active : null)} onClick={this.pictureShow}>盘口</div>
									<div className={classnames(globalStyles.flexCenter, display == 0 ? styles.active : null)} data-flag={0} onClick={this.pictureHide}>画面A</div>
									<div className={classnames(globalStyles.flexCenter, display == 2 ? styles.active : null)} data-flag={2} onClick={this.pictureHide}>画面B</div>
								</div>
							</div>
						</div>

						<div className={styles.middle}>
							<div className={classnames(globalStyles.flexSb, styles.mBottom5)}>
								<div className={globalStyles.flex}>
									<div className={classnames(globalStyles.flex, styles.smallTab, styles.mRight10)}>
										{this.eventStatus.map((item, index) => (
											<Fragment key={index}>
												{info.event_status >= item.event_status ? (
													<div
														key={index}
														className={classnames(globalStyles.flexCenter, info.event_status >= item.event_status ? styles.disabled : null)}
													>{item.title}</div>
												) : (
													<Popconfirm
														title={<div style={{ marginLeft: -20 }}>确定{item.title}比赛吗？</div>}
														onConfirm={() => { this.editEventStatus(item.event_status) }}
														okText="确定"
														cancelText="取消"
														placement="topLeft"
														icon=""
													>
														<div
															key={index}
															className={classnames(globalStyles.flexCenter)}
														>{item.title}</div>
													</Popconfirm>
												)}
											</Fragment>
										))}
									</div>
									<div className={classnames(globalStyles.flex, styles.ratioEditor, styles.mRight10)}>
										<div className={classnames(globalStyles.flexCenter, styles.ratioLeft)}>
											{info.teams && info.teams[0].result && info.teams[1].result  ? `${info.teams[0].result} : ${info.teams[1].result}` : ''}
										</div>
										<div className={classnames(globalStyles.flexCenter, styles.ratioRight)} onClick={this.editResult}>
											<Icon type="edit" style={{ cursor: 'pointer' }} />
										</div>
									</div>
								</div>
								<div className={classnames(globalStyles.flexCenter, styles.groupTab)}>
									{groupIdList && groupIdList.length ? groupIdList.map((item, index) => (
										<div
											key={item}
											className={item == activeGroup ? styles.active : null}
											data-group={item}
											data-index={index}
											onClick={this.handleGroup}
										>{DataSpGroups.getField(item, 'name')}</div>
									)) : <div>暂无分组</div>}
								</div>
								<div className={classnames(styles.operator, styles.bigOperator, globalStyles.flex)} style={{ width: '16.7%' }}>
									<div
										className={classnames(
											globalStyles.flexCenter,
											// b_item.status == item[0].bet_status ? styles.active : null,
											info.assort && info.assort[defaultActiveKey].bet_status == 1 ? styles.disabled : null,
											(defaultActiveKey == 0 && isDisabledBet) || (defaultActiveKey == 1 && isDisabledInplay) ? styles.disabled : null
										)}
										style={{ flex: '1.5' }}
										onClick={() => {
											if (info.assort && info.assort[defaultActiveKey].bet_status == 1 || (defaultActiveKey == 0 && isDisabledBet) || (defaultActiveKey == 1 && isDisabledInplay)) return;
											this.startEventBet()
										}}
										>开启{defaultActiveKey == 0 ? '早盘' : '滚盘'}</div>
									<div
										className={classnames(
											globalStyles.flexCenter,
											// b_item.status == item[0].bet_status ? styles.active : null,
											info.assort && info.assort[defaultActiveKey].bet_status == 0 ? styles.disabled : null
										)}
										onClick={() => {
											if (info.assort && info.assort[defaultActiveKey].bet_status == 0) return;
											this.stopBetAll()
										}}
									>暂停</div>
									<div
										className={classnames(
											globalStyles.flexCenter,
											// b_item.status == item[0].bet_status ? styles.active : null,
											info.assort && info.assort[defaultActiveKey].bet_status == 0 ? styles.disabled : null,
											(defaultActiveKey == 0 && isDisabledBet) || (defaultActiveKey == 1 && isDisabledInplay) ? styles.disabled : null
										)}
										onClick={() => {
											if (info.assort && info.assort[defaultActiveKey].bet_status == 0 || (defaultActiveKey == 0 && isDisabledBet) || (defaultActiveKey == 1 && isDisabledInplay)) return;
											this.closeEventBet();
										}}
									>封盘</div>
									{/* <div className={classnames(styles.single, styles.mRight10)}>
										<Popconfirm
											placement="bottomRight"
											title="确定暂停全部玩法？"
											okText="确定"
											cancelText="取消"
											onConfirm={this.stopBetAll}
										>
											<div
												className={classnames(globalStyles.flexCenter)}
											>全部暂停</div>
										</Popconfirm>
									</div> */}
								</div>
							</div>
							
							<div className={styles.midContent}>
								{_data && _data.length ? _data.map((item, index) => (
									<Fragment key={index}>
										<div className={classnames(styles.spTitle, globalStyles.flexSb)}>
											{item[0].sp_name}
											<div className={classnames(styles.operator, styles.bigOperator, globalStyles.flex)}>
												{this.betStatus.map((b_item, index) => (
													<Fragment key={index}>
														{/* {info.assort && info.assort[defaultActiveKey].bet_status == 0 || b_item.status == item[0].bet_status ? ( */}
														{info.assort && info.assort[defaultActiveKey].bet_status == 0 ? (
															<div
																className={classnames(
																	globalStyles.flexCenter,
																	// b_item.status == item[0].bet_status ? styles.active : null,
																	info.assort && info.assort[defaultActiveKey].bet_status == 0 ? styles.disabled : null
																)}
															>{b_item.title}</div>
														) : (
															// <Popconfirm
															// 	title={`确定此玩法${b_item.title}？`}
															// 	placement="bottomRight"
															// 	okText="确定"
															// 	cancelText="取消"
															// 	onConfirm={() => {
															// 		// if (b_item.status == item[0].bet_status) return;
															// 		this.editBetStatus(b_item.status, item)
															// 	}}
															// >
																<div
																	className={classnames(globalStyles.flexCenter)}
																	onClick={() => {
																		// if (b_item.status == item[0].bet_status) return;
																		this.editBetStatus(b_item.status, item)
																	}}
																>{b_item.title}</div>
															// </Popconfirm>
														)}
													</Fragment>
												))}
											</div>
										</div>
										<div className={styles.box}>
											<div className={classnames(globalStyles.flexSb, styles.tHead)}>
												<span className={styles.tName}>选项名称</span>
												<span className={styles.tSource}>源赔率</span>
												<span className={styles.tOdds}>输出赔率</span>
												<span className={styles.tWater}>调水比</span>
												<span className={styles.tRate}>概率</span>
												<span className={styles.tOrder}>订单数</span>
												<span className={styles.tAmount}>投注额</span>
												<span className={styles.tProfit}>{detail.lottery_status == 2 ? '盈亏' : '最大盈亏'}</span>
												<span className={styles.tEdit}>操作</span>
											</div>
											<div className={styles.tBody}>
												{item.map(sp_item => (
													<div className={globalStyles.flexSb} key={sp_item._id}>
														<div className={styles.tName}>{sp_item.name}</div>
														<div className={styles.tSource}>{(sp_item.start_odds).toFixed(2)}</div>
														<div className={styles.tOdds}>{(sp_item.odds).toFixed(2)}</div>
														<div className={styles.tWater}>{(sp_item.ratio).toFixed(2)}<span className={styles.font14}>%</span></div>
														<div className={styles.tRate}>{(sp_item.probability * 100).toFixed(2)}<span className={styles.font14}>%</span></div>
														<div className={styles.tOrder}>{utils.formatMoney(sp_item.orders, 0)}</div>
														<div className={styles.tAmount}>
															<div className={styles.mBottom3}>
																{utils.formatMoney(sp_item.amount / 100)}
															</div>
															<Progress
																percent={spRisk[item[0].sp_id] && spRisk[item[0].sp_id]['odds_upper'] ? this.renderRate(sp_item.amount / (spRisk[item[0].sp_id]['odds_upper'] / 100)) : 0}
																strokeColor={spRisk[item[0].sp_id] && spRisk[item[0].sp_id]['odds_upper'] && sp_item.amount / (spRisk[item[0].sp_id]['odds_upper'] / 100) >= 90 ? this.color[1] : this.color[0]}
																strokeWidth={3}
																showInfo={false}
																className={classnames(styles.progressLine, styles.tableLine)}
															/>
														</div>
														<div className={classnames(styles.tProfit, sp_item.profit < 0 ? styles.red : (sp_item.profit > 0 ?styles.green : ''))}>
															<div className={styles.mBottom3}>
																{detail.lottery_status == 2 && sp_item.settle_result != 1 ? '-' : utils.formatMoney(sp_item.profit / 100)}
															</div>
															<Progress
																percent={sp_item.profit < 0 && spRisk[item[0].sp_id] && spRisk[item[0].sp_id]['loss_upper'] ? this.renderRate(Math.abs(sp_item.profit) / (spRisk[item[0].sp_id]['loss_upper'] / 100)) : 0}
																strokeColor={spRisk[item[0].sp_id] && spRisk[item[0].sp_id]['loss_upper'] && Math.abs(sp_item.profit) / (spRisk[item[0].sp_id]['loss_upper'] / 100) >= 90 ? this.color[1] : this.color[0]}
																strokeWidth={3}
																showInfo={false}
																className={classnames(styles.progressLine, styles.tableLine)}
															/>
														</div>
														<div className={styles.tEdit}>
															<div className={classnames(styles.operator, styles.smallOperator, globalStyles.flex)}>
																{this.betStatus.map((b_item, index) => (
																	<Fragment key={index}>
																		{info.assort && info.assort[defaultActiveKey].bet_status == 0 || b_item.status == sp_item.bet_status ? (
																			<div
																				className={classnames(
																					globalStyles.flexCenter,
																					b_item.status == sp_item.bet_status ? styles.active : null,
																					info.assort && info.assort[defaultActiveKey].bet_status == 0 ? styles.disabled : null
																				)}
																			>{b_item.title}</div>
																		) : (
																			// <Popconfirm
																			// 	title={`确定此选项${b_item.title}？`}
																			// 	okText="确定"
																			// 	cancelText="取消"
																			// 	onConfirm={() => {
																			// 		if (b_item.status == sp_item.bet_status) return;
																			// 		this.editOptionBetStatus(b_item.status, sp_item)
																			// 	}}
																			// >
																				<div
																					className={classnames(globalStyles.flexCenter)}
																					onClick={() => {
																						if (b_item.status == sp_item.bet_status) return;
																						this.editOptionBetStatus(b_item.status, sp_item)
																					}}
																				>{b_item.title}</div>
																			// </Popconfirm>
																		)}
																	</Fragment>
																))}
															</div>
														</div>
													</div>
												))}
											</div>
										
											<div className={classnames(styles.mTop20, globalStyles.flexSb)}>
												<div className={classnames(styles.proLine)}>
													<div className={styles.proLineBg} style={{ width: this.renderWidth(item) }}></div>
													<div className={classnames(styles.proContent, globalStyles.flex)}>
														<span className={styles.mRight15}>SP：{spRisk[item[0].sp_id] ? utils.formatMoney(spRisk[item[0].sp_id]['sp_upper'] / 100, 0) : '-'}</span>
														<span className={styles.mRight10}>OP：{spRisk[item[0].sp_id] ? utils.formatMoney(spRisk[item[0].sp_id]['odds_upper'] / 100, 0) : '-'}</span>
														{spRisk[item[0].sp_id] ? (
															<Popconfirm
																title={this.renderUpperPop(spRisk[item[0].sp_id])}
																onConfirm={() => { this.editOdds(spRisk[item[0].sp_id]) }}
																okText="确定"
																cancelText="取消"
																icon=""
															>
																<Icon type='edit' />
															</Popconfirm>
														) : null}
													</div>
												</div>
												<div className={styles.dividerHight}></div>
												<div className={globalStyles.flex}>
													<div>
														<div className={styles.rateTitle}>赔付率</div>
														<div className={styles.font20}>{(item[0].loss_ratio * 100).toFixed(2)}<span className={styles.font14}>%</span></div>
													</div>
													{!is_build || item.length > 3 || !is_bet_play || !!item[0].allow_bot_adjust ? (
														<Icon type='edit' style={{ marginLeft: 10, color: '#AAAAAA', cursor: 'not-allowed' }} />
													) : (
														<Popconfirm
															title={<Fragment>
																<div style={{ marginLeft: -20 }}>
																	赔付率：
																	<Input
																		defaultValue={(item[0].loss_ratio * 100).toFixed(2)}
																		type="text"
																		placeholder="请输入"
																		suffix="%"
																		style={{ width: 100 }}
																		onChange={(e) => { this.handleLossRatio(e, item[0]) }}
																	/>
																</div>
															</Fragment>}
															okText="确定"
															cancelText="取消"
															onConfirm={() => {
																this.editLossRatio(item)
															}}
															icon=""
														>
															<Icon type='edit' style={{ marginLeft: 10, color: '#AAAAAA' }} />
														</Popconfirm>
													)}
												</div>
												<div className={styles.dividerHight}></div>
												{item && item.length == 2 ? (
													<Fragment>
														<div>
															<div className={styles.rateTitle}>主队胜率</div>
															<div className={styles.font20}>{(item[0].probability * 100).toFixed(2)}<span className={styles.font14}>%</span></div>
														</div>
														<div className={classnames(styles.font18, styles.mLeft10, styles.mRight10)}>+</div>
														<div className={classnames(globalStyles.flex, styles.tab, styles.number, styles.numberSimple, styles.mRight10)}>
															{this.numberSimple.map((n_item, index) => (
																<div
																	key={index}
																	className={classnames(globalStyles.flexCenter, !is_build || !is_bet_play || !!item[0].allow_bot_adjust ? styles.disabled : null)}
																	onClick={() => {
																		// if (item.length > 2 || !is_build || !is_bet_play || !!item[0].allow_bot_adjust) return;
																		if (!is_bet_play) {
																			message.warning('此赛事盘已结束');
																			return;
																		}
																		if (!is_build) {
																			message.warning('此赛事不是自建的赛事');
																			return;
																		}
																		if (!!item[0].allow_bot_adjust) {
																			message.warning('自动调水中，不可修改');
																			return;
																		}
																		this.handleNumberAdd(item, n_item)
																	}}
																>{n_item}</div>
															))}
														</div>
														<div className={classnames(styles.font18, styles.mRight10)}>-</div>
														<div className={classnames(globalStyles.flex, styles.tab, styles.number, styles.numberSimple)}>
															{this.numberSimple.map((n_item, index) => (
																<div
																	key={index}
																	className={classnames(globalStyles.flexCenter, !is_build || !is_bet_play || !!item[0].allow_bot_adjust ? styles.disabled : null)}
																	onClick={() => {
																		// if (item.length > 2 || !is_build || !is_bet_play || !!item[0].allow_bot_adjust) return;
																		if (!is_bet_play) {
																			message.warning('此赛事盘已结束');
																			return;
																		}
																		if (!is_build) {
																			message.warning('此赛事不是自建的赛事');
																			return;
																		}
																		if (!!item[0].allow_bot_adjust) {
																			message.warning('自动调水中，不可修改');
																			return;
																		}
																		this.handleNumberMinus(item, n_item)
																	}}
																>{n_item}</div>
															))}
														</div>
														<div className={styles.dividerHight}></div>
														<div className={classnames(styles.mainProb, globalStyles.flex, styles.mRight10)}>
															<div>
																<Input
																	type="text"
																	placeholder={!focusObj[item[0].sp_id] ? (item[0].probability * 100).toFixed(2) : null}
																	// placeholder={!(!is_build || !is_bet_play || !!item[0].allow_bot_adjust) ? (item[0].probability * 100).toFixed(2) : null}
																	// defaultValue={!is_build || !is_bet_play || !!item[0].allow_bot_adjust ? (item[0].probability * 100).toFixed(2) : null}
																	onChange={(e) => { this.handleMainProb(item, e) }}
																	onFocus={(e) => { 
																		const obj = {}
																		obj[item[0].sp_id] = true;
																		this.setState({
																			focusObj: obj,
																		})
																	 }}
																	onBlur={(e) => {
																		const obj = focusObj
																		obj[item[0].sp_id] = false;
																		this.setState({
																			focusObj: obj,
																		});
																		this.handleMainProbBlur(item, e)
																	}}
																	disabled={!is_build || !is_bet_play || !!item[0].allow_bot_adjust}
																/>
															</div>
															<div
																className={classnames(
																	globalStyles.flexCenter,
																	styles.slideRight,
																	this.isSliderChange(item, mainProb, true) ? styles.active : null,
																)}
															>
																<Icon
																	type='rocket'
																	onClick={() => {
																		if (!this.isSliderChange(item, mainProb, true)) return;
																		if (!is_build || !is_bet_play || !!item[0].allow_bot_adjust) return;
																		this.editProbability(item, mainProb)
																	}}
																/>
															</div>
														</div>
													</Fragment>
												) : (
													<Fragment>
														<div className={classnames(styles.slideWrap, globalStyles.flex, styles.mRight10)}>
															<div className={classnames(globalStyles.flexCenter, styles.slideLeft)}>
																{this.renderSlider(item, is_bet_play, is_build)}
															</div>
															<div
																className={classnames(
																	globalStyles.flexCenter,
																	styles.slideRight,
																	this.isSliderChange(item, probability) ? styles.active : null,
																)}
															>
																<Icon
																	type='rocket'
																	onClick={() => {
																		if (!this.isSliderChange(item, probability)) return;
																		this.editProbability(item)
																	}}
																/>
															</div>
														</div>

														<div className={classnames(globalStyles.flex, styles.tab, styles.number, styles.mRight10)}>
															{this.number.map((n_item, index) => (
																<div
																	key={index}
																	className={classnames(globalStyles.flexCenter, item.length > 2 || !is_build || !is_bet_play || !!item[0].allow_bot_adjust ? styles.disabled : null)}
																	onClick={() => {
																		// if (item.length > 2 || !is_build || !is_bet_play || !!item[0].allow_bot_adjust) return;
																		if (item.length > 2) {
																			message.warning('玩法选项数大于2');
																			return;
																		}
																		if (!is_bet_play) {
																			message.warning('此赛事盘已结束');
																			return;
																		}
																		if (!is_build) {
																			message.warning('此赛事不是自建的赛事');
																			return;
																		}
																		if (!!item[0].allow_bot_adjust) {
																			message.warning('自动调水中，不可修改');
																			return;
																		}
																		this.handleNumber(item, n_item)
																	}}
																>{n_item}</div>
															))}
														</div>

														<div className={classnames(globalStyles.flex, styles.addBox, styles.mRight10)}>
															<div
																className={!is_build || !is_bet_play ? styles.disabled : null}
																onClick={() => {
																	if (!is_build || !is_bet_play) return;
																	this.handleMinus(item[0].sp_id);
																}}
															>-</div>
															<div className={styles.count}>{countObj[item[0].sp_id]}</div>
															<div
																className={!is_build || !is_bet_play ? styles.disabled : null}
																onClick={() => {
																	if (!is_build || !is_bet_play) return;
																	this.handleAdd(item[0].sp_id)
																}}
															>+</div>
														</div>
													</Fragment>
												)}

												{item.length > 3 || !allowAdjust || !is_bet_play ? (
													<div
														className={classnames(styles.adjustBtn, item[0].allow_bot_adjust ? styles.active : null, styles.disabled)}
													>
														<MyIcon type="icon-water" />
													</div>
												) : (
													// <Popconfirm
													// 	title={`确定${!item[0].allow_bot_adjust ? '开启' : '关闭'}此玩法自动调水？`}
													// 	okText="确定"
													// 	cancelText="取消"
													// 	onConfirm={() => {
													// 		this.editAllowBotAdjust(item)
													// 	}}
													// >
														<div
															className={classnames(styles.adjustBtn, item[0].allow_bot_adjust ? styles.active : null)}
															onClick={() => {
																this.editAllowBotAdjust(item);
															}}
														>
															{/* {!item[0].allow_bot_adjust ? '自动调水' : '关闭调水'} */}
															<MyIcon type="icon-water" />
														</div>
													// </Popconfirm>
												)}

											</div>
										</div>
									</Fragment>
								)) : null}
							</div>
						</div>

					</div>
				</div>
	}
}

import React, { PureComponent, Fragment } from 'react';
import {
	Row,
	Col,
	Card,
	Tabs,
	Input,
	InputNumber,
	Empty,
	Popconfirm,
	Icon,
	Tooltip,
	message,
} from 'antd';
import utils from '@/utils';
import { AUTH } from '@/enum';
import NetOperation from '@/net/operation';
import NetMarket from '@/net/market';
import VirtualDetails from './VirtualDetails';
import BountyDetails from './BountyDetails';
import CapitalDetails from './CapitalDetails';
import BetOrder from './BetOrder';
import RedEnvelop from './RedEnvelop';
import SchemeOrder from './SchemeOrder';
import DataGlobalParams from '@/data/GlobalParams';
import styles from '../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const TabPane = Tabs.TabPane;
const Search = Input.Search;

export default class extends PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			card: [],
			tabMenu: [
				{
					key: '0',
					title: '虚拟币流水',
					content: <VirtualDetails {...this.props} ref={ i => this.virtualDetails = i} />
				}, {
					key: '1',
					title: '积分流水',
					content: <BountyDetails {...this.props} ref={ i => this.bountyDetails = i} />
				}, {
					key: '2',
					title: '资金流水',
					content: <CapitalDetails {...this.props} ref={ i => this.capitalDetails = i} />
				}, {
					key: '3',
					title: '竞猜订单',
					content: <BetOrder {...this.props} ref={ i => this.betOrder = i} />
				}, {
					key: '4',
					title: '方案订单',
					content: <SchemeOrder {...this.props} ref={ i => this.schemeOrder = i} />
				}, {
					key: '5',
					title: '红包记录',
					content: <RedEnvelop {...this.props} />
				}
			],
			integralRate: DataGlobalParams.getIntegralRate(),
			coinRate: DataGlobalParams.getCoinRate(),
			activeTab: '0',
			verifiedInfo: null,
			waitingAward: 0,
			fundInfo: {
				bounty_balance: 0,
				capital_balance: 0,
				virtual_balance: 0,
				total_cash: 0,
				total_recharge: 0,
				virtual_frozen: 0,
				bounty_frozen: 0,
				capital_frozen: 0,
				total_profit_loss: 0
			},
			risk: {
				_id: '',
				bet_single_limit: 0,
				bet_daily_limit: 0,
				total_loss_limit: 0
			},
			riskLimit: {
				list: false,
				edit: false
			}
		}
	}

	componentDidMount() {
		const props = this.props;
		const riskLimit = {
			list: props.checkAuth(1, AUTH.ALLOW_CUSTOMER_RISK),
			edit: props.checkAuth(4, AUTH.ALLOW_CUSTOMER_RISK)
		};
		this.setState({
			riskLimit: riskLimit
		}, () => {
			this.getFundInfo();
			this.getCard();
			this.getVerifiedInfo();
			this.getWaitingAward();
			if (riskLimit.list) {
				this.getCustomerRisk();
			}
		});
	}

	getFundInfo() {
		NetOperation.getCustomerFund(this.props.id).then(res => {
			this.setState({
				fundInfo: res.data
			});
		}).catch(err => {
			console.log(err, 'err');
		});
	}

	getVerifiedInfo() {
		const { id, isCompliance } = this.props;
		NetOperation.getVerifiedInfo(id).then(res => {
			if (!isCompliance) {
				if (res.data.realname) {
					res.data.realname = this.handleRealname(res.data.realname);
				}
				if (res.data.identity_number) {
					res.data.identity_number = this.handleIdentityNumber(res.data.identity_number);
				}
			}
			this.setState({
				verifiedInfo: res.data
			});
		}).catch(err => {
			if (err.code != 404) {
				console.log(err, 'err');
			}
		});
	}
	
	getCard() {
		const { id, isCompliance } = this.props;
		NetOperation.getCustomerCard(id).then(res => {
			const data = res.data;
			if (data && data.length) {
				if (!isCompliance) {
					data.map(item => {
						item.card_number = this.handleCard(item.card_number);
					});
				}
				this.setState({
					card: data,
				});
			}
		}).catch(err => {
			console.log(err, 'err');
		});
	}

	getWaitingAward() {
		NetMarket.getWaitingAward(this.props.id).then(res => {
			this.setState({
				waitingAward: res.data.amount
			});
		}).catch(err => {
			console.log(err, 'err');
		});
	}

	getCustomerRisk() {
		NetOperation.getSingleCustomerRisk(this.props.id).then(res => {
			const data = res.data;
			let riskId = data._id;
			if (data._id == '0') {
				riskId = '';
			}
			this.setState({
				risk: {
					_id: riskId,
					bet_single_limit: data.bet_single_limit / 100,
					bet_daily_limit: data.bet_daily_limit / 100,
					total_loss_limit: data.total_loss_limit / 100,
				}
			});
		}).catch(err => {
			console.log(err, 'err');
		});
	}

	handleCard(str) {
		if (str.length < 12) return str;
		return str.replace(/^(.{0})(?:\d+)(.{4})$/, "$1**** **** $2");
	}

	handleRealname(str) {
		let result = '';
		let length = str.length;

		if (length == 4) {
			result = str.replace(/^(.{2})(.*)$/, "$1");
		} else if (length > 4 && str.indexOf('·') != -1) {
			const items = str.split('·');
			result = items[0];
		} else {
			result = str.replace(/^(.{1})(.*)$/, "$1");
		}

		length -= result.length;
		for (let i = 0; i < length; i++) {
			result += '*';
		}
		return result;
	}

	handleIdentityNumber(str) {
		if (str.length != 18) return str;
		// return str.replace(/^(.{0})(?:\d+)(.{4})$/, "$1**************$2");
		return "******************";
	}

	handleTabChange(activeKey) {
		this.iSearch.input.setValue('');
		this.setState({activeTab: activeKey});
	}

	handleRiskChange = (value, type) => {
		const { risk } = this.state;
		switch (type) {
			case 1:
				risk.bet_single_limit = value;
				break;
			case 2:
				risk.bet_daily_limit = value;
				break;
			case 3:
				risk.total_loss_limit = value;
				break;
		}
	}

	editRisk = () => {
		const { data } = this.props;
		const { risk } = this.state;
		const items = {
			customer_id: data._id,
			bet_single_limit: risk.bet_single_limit * 100,
			bet_daily_limit: risk.bet_daily_limit * 100,
			total_loss_limit: risk.total_loss_limit * 100
		};
		if (risk._id) {
			NetOperation.editCustomerRisk(risk._id, items).then((res) => {
				message.success('编辑成功');
				this.getCustomerRisk();
			}).catch((e) => {
				message.error(e.msg);
			});
		} else {
			NetOperation.createCustomerRisk(items).then((res) => {
				message.success('编辑成功');
				this.getCustomerRisk();
			}).catch((e) => {
				message.error(e.msg);
			});
		}
	}

	tableSearch = (value) => {
		switch (this.state.activeTab) {
			case '0': this.virtualDetails.searchFilter({ order_number: value }); break;
			case '1': this.bountyDetails.searchFilter({ order_number: value }); break;
			case '2': this.capitalDetails.searchFilter({ order_number: value }); break;
			case '3': this.betOrder.searchFilter({ filter: `order_number:${value}` }); break;
			case '4': this.schemeOrder.searchFilter({ filter: `order_number:${value}` }); break;
		}
	}

	render() {
		const {
			verifiedInfo, 
			fundInfo, 
			coinRate, 
			integralRate, 
			card, 
			tabMenu,
			activeTab,
			waitingAward,
			risk,
			riskLimit
		} = this.state;

		const { data } = this.props;

		let certifyType = '';
		switch (data.certify_type) {
			case 0: certifyType = '身份证'; break;
			case 1: certifyType = '护照'; break;
			case 2: certifyType = '港澳台证'; break;
			case 3: certifyType = '军官证'; break;
		}

		const virtualBalance = (fundInfo.virtual_balance / coinRate) || 0;
		const virtualFrozen = (fundInfo.virtual_frozen / coinRate) || 0;
		const totalRecharge = (fundInfo.total_recharge / coinRate) || 0;
		const totalConsume = (fundInfo.total_consume / coinRate) || 0;

		const bountyBalance = (fundInfo.bounty_balance / integralRate) || 0;
		const bountyFrozen = (fundInfo.bounty_frozen / integralRate) || 0;
		const totalCash = (fundInfo.total_cash / integralRate) || 0;

		const capitalBalance = (fundInfo.capital_balance / 100) || 0;
		const capitalFrozen = (fundInfo.capital_frozen / 100) || 0;
		const totalProfitLoss = (fundInfo.total_profit_loss / 100) || 0;

		return <div className={globalStyles.detailContent}>
					<Card
						title={<strong>实名认证</strong>}
						bordered={false}
					>
						<Row>
							<Col span={12}>
								<p>实名状态：<span>{data.is_verified == 0 ? '未实名' : '已实名'}</span></p>
							</Col>
							<Col span={12}>
								<p>证件类型：<span>{data.is_verified == 0 ? '-' : '身份证'}</span></p>
							</Col>
							<Col span={12}>
								<p>证件姓名：<span>{verifiedInfo ? verifiedInfo.realname : '-'}</span></p>
							</Col>
							<Col span={12}>
								<p>证件号：<span>{verifiedInfo ? verifiedInfo.identity_number : '-'}</span></p>
							</Col>
						</Row>
					</Card>
					<Card
						title={<strong>资产明细</strong>}
						bordered={false}
					>
						<Row className={globalStyles.cardBody}>
							<Col xl={6} md={12}>
								<p className={globalStyles.divColTitle}>虚拟币账户</p>
								<p>账户余额：<span>{utils.formatMoney(virtualBalance)}</span></p>
								<p>可用余额：<span>{utils.formatMoney(virtualBalance - virtualFrozen)}</span></p>
								<p>冻结余额：<span>{utils.formatMoney(virtualFrozen)}</span></p>
								<p>累计充值：<span>{utils.formatMoney(totalRecharge)}</span></p>
								<p>其他消费
									<Tooltip placement="top" title="购买道具+购买方案+活动消耗+主播打赏-方案退款">
										<Icon type="info-circle" style={{ marginLeft: '5px', fontSize: 16, color: '#929292' }} />
									</Tooltip>：<span>{utils.formatMoney(totalConsume)}</span></p>
							</Col>
							<Col xl={6} md={12}>
								<p className={globalStyles.divColTitle}>积分账户</p>
								<p>账户余额：<span>{utils.formatMoney(bountyBalance)}</span></p>
								<p>可用余额：<span>{utils.formatMoney(bountyBalance - bountyFrozen)}</span></p>
								<p>冻结余额：<span>{utils.formatMoney(bountyFrozen)}</span></p>
								<p>累计兑现：<span>{utils.formatMoney(totalCash)}</span></p>
							</Col>
							<Col xl={7} md={12}>
								<p className={globalStyles.divColTitle}>资金账户</p>
								<p>账户余额：<span>{utils.formatMoney(capitalBalance)}</span></p>
								<p>可用余额：<span>{utils.formatMoney(capitalBalance - capitalFrozen)}</span></p>
								<p>冻结余额：<span>{utils.formatMoney(capitalFrozen)}</span></p>
								<p>投注额(待开奖)：<span>{utils.formatMoney(waitingAward / coinRate)}</span></p>
								<p>累计盈亏：<span>{utils.formatMoney(totalProfitLoss)}</span></p>
							</Col>
							<Col xl={5} md={12}>
								<p className={globalStyles.divColTitle}>营销活动</p>
								<p>红冲蓝补：<span>{utils.formatMoney(fundInfo.total_reverse / 100)}</span></p>
								<p>红包奖励：<span>{utils.formatMoney(fundInfo.total_reward / 100)}</span></p>
							</Col>
						</Row>
					</Card>
					{riskLimit.list ? (<Card
						title={<strong>风控设置</strong>}
						bordered={false}
					>
						<Row className={globalStyles.cardBody}>
							<Col span={8}>
								<p>
									单笔投注上限：<span className={risk._id ? globalStyles.changedColor : null}>{utils.formatMoney(risk.bet_single_limit)}</span>
									{riskLimit.edit ? (<Popconfirm
										title={
											<div style={{ marginLeft: -20 }}>
												单笔投注上限：
												<InputNumber
													min={1}
													defaultValue={risk.bet_single_limit}
													step={1}
													onChange={(value) => { this.handleRiskChange(value, 1) }}
												/> 
											</div>
										}
										onConfirm={() => { this.editRisk() }}
										okText="确定"
										cancelText="取消"
										icon=""
									>
										<Icon type="edit" style={{ marginLeft: 10 }} />
									</Popconfirm>): null}
								</p>
							</Col>
							<Col span={8}>
								<p>
									每日投注上限：<span className={risk._id ? globalStyles.changedColor : null}>{utils.formatMoney(risk.bet_daily_limit)}</span>
									{riskLimit.edit ? (<Popconfirm
										title={
											<div style={{ marginLeft: -20 }}>
												每日投注上限：
												<InputNumber
													min={1}
													defaultValue={risk.bet_daily_limit}
													step={1}
													onChange={(value) => { this.handleRiskChange(value, 2) }}
												/> 
											</div>
										}
										onConfirm={() => { this.editRisk() }}
										okText="确定"
										cancelText="取消"
										icon=""
									>
										<Icon type="edit" style={{ marginLeft: 10 }} />
									</Popconfirm>): null}
								</p>
							</Col>
							<Col span={8}>
								<p>
									累计亏损上限：<span className={risk._id ? globalStyles.changedColor : null}>{utils.formatMoney(risk.total_loss_limit)}</span>
									{riskLimit.edit ? (<Popconfirm
										title={
											<div style={{ marginLeft: -20 }}>
												累计亏损上限：
												<InputNumber
													min={1}
													defaultValue={risk.total_loss_limit}
													step={1}
													onChange={(value) => { this.handleRiskChange(value, 3) }}
												/> 
											</div>
										}
										onConfirm={() => { this.editRisk() }}
										okText="确定"
										cancelText="取消"
										icon=""
									>
										<Icon type="edit" style={{ marginLeft: 10 }} />
									</Popconfirm>): null}
								</p>
							</Col>
						</Row>
					</Card>) : null}
					{this.props.isCompliance ? (<Card
						title={<strong>银行卡</strong>}
						bordered={false}
					>
						<div className={globalStyles.cardBody}>
							{card.length ? (
								<Row className={styles.creditWrap} gutter={24}>
									{card.map(item => (
										<Col xxl={6} lg={12} sm={24} key={item._id}>
											<div className={styles.creditItem}>
												<h3>{item.bank_name}</h3>
												<div className={styles.type}>{item.card_type == 1 ? '信用卡' : '储蓄卡'}</div>
												<div className={styles.number}>{item.card_number}</div>
											</div>
										</Col>
									))}
								</Row>
							) : (
								<Fragment>
									<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
								</Fragment>
							)}
						</div>
					</Card>) : null}
					<Card
						bodyStyle={{ position: 'relative', padding: '0' }}
						bordered={false}
					>
						<div style={{ width: '200px', display: 'none' }}>
							<Search
								onSearch={this.tableSearch}
								className={styles.tableSearch}
								placeholder="请输入流水号"
								ref={(i) => {
									this.iSearch = i;
								}}
							/>
						</div>
						<Tabs
							activeKey={activeTab}
							animated={false}
							onChange={(key) => { this.handleTabChange(key) }}
						>
							{tabMenu.map(item => {
									return <TabPane tab={item.title} key={item.key}>
										{
											activeTab == item.key ?
											item.content :
											null
										}
									</TabPane>
								}
							)}
						</Tabs>
					</Card>
				</div>
	}
}

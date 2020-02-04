import React, { Component, Fragment } from 'react';
import {
	Card,
	Col,
	Row,
	Form,
	Input,
	Button,
	Select,
	message,
	Checkbox,
	Collapse,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import moment from 'moment';
import classnames from 'classnames';
import NetMarket from '@/net/market';
import NetMedia from '@/net/media';
import DataGames from '@/data/Games';
import DataGlobalParams from '@/data/GlobalParams';
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			coinRate: DataGlobalParams.getCoinRate(),
			schemeInfo: {},
			eventInfo: {},
			spData: [],
			oddsData: []
		}
	}

	componentWillMount() {
		this.getData((data) => {
			this.getEventData(data.event_id);
			this.getSpData(data.event_id);
		});
	}

	onSubmit = (e) => {
		const state = this.state;
		const schemeInfo = state.schemeInfo;
		const eventInfo = state.eventInfo;
		const oddsData = state.oddsData;
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let eventData = {
					league_name: eventInfo.league.name,
					begin_time: eventInfo.begin_time,
					home_team_id: eventInfo.teams[0]._id,
					away_team_id: eventInfo.teams[1]._id,
					sp_id: oddsData[schemeInfo.odds_id]._id,
					sp_name: oddsData[schemeInfo.odds_id].name
				};
				let data = {
					title: values.title,
					event_id: schemeInfo.event_id,
					event_info: JSON.stringify(eventData),
					odds_id: schemeInfo.odds_id,
					expert_id: values.expert_id,
					price: values.price * state.coinRate,
					status: values.status ? 1 : 0,
					is_top: values.is_top ? 1 : 0,
					is_hit: values.is_hit ? 1 : 0,
					reason: values.reason
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true
		})
		NetMedia.updateScheme(this.props.id, data).then((res) => {
			message.success('编辑成功');
			this.props.okCallback();
			this.setState({
				isLoading: false
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false
			});
		});
	}

	getData = (callback) => {
		let id = this.props.id;
		if(isNaN(id)) {
			id = localStorage.getItem('schemeEventId');
		}
		localStorage.setItem('schemeEventId', id);
		NetMedia.getSingleScheme(id).then(res => {
			const data = res.data;
			if (typeof(callback) == 'function') {
				callback(data);
			}
			this.setState({
				schemeInfo: data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getEventData = (event_id) => {
		NetMarket.getEventInfo(event_id).then(res => {
			this.setState({
				eventInfo: res.data
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getSpData(event_id) {
		const data = {
			event_id: event_id,
		};
		NetMarket.getEventTrades(data).then(res => {
			let spList = [];
			let spData = [];
			const oddsData = [];
			const data = res.data.rows;
			data.map(item => {
				oddsData[item._id] = {_id: item.sp_id, name: item.sp_name};
				if (spList.indexOf(item.sp_id) == -1) {
					const json = {
						_id: item.sp_id,
						name: item.sp_name,
						op: [{
							op_id: item.op_id,
							name: item.name,
							odds_id: item._id,
							odds: item.odds,
						}]
					};
					spData.push(json);
					spList.push(item.sp_id);
				} else {
					const json = {
						op_id: item.op_id, 
						name: item.name,
						odds_id: item._id,
						odds: item.odds,
					};
					spData[spData.length - 1].op.push(json);
				}
			});
			this.setState({
				spData, oddsData
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	generateOpList = (data, value) => {
		return data.op.map(item => {
			return <dd 
						key={item.odds_id} 
						className={item.odds_id == value ? styles.selected : null} 
						onClick={() => {this.selectOption(item.odds_id)} }
					>
						{item.name}
						<label>（{item.odds}）</label>
					</dd>
		});
	}

	selectOption = (oddsId) => {
		let schemeInfo = this.state.schemeInfo;
		schemeInfo.odds_id = oddsId;
		this.setState({
			schemeInfo
		});
	}

	render() {
		const props = this.props;
		const state = this.state;
		const { schemeInfo, eventInfo, spData } = state;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 15 },
		};
		const { getFieldDecorator } = this.props.form;
		const price = (schemeInfo.price / state.coinRate) || 0;

		if (!spData.length) return null;

		let activeKey = '';
		spData.map(item => {
			item.op.map(op => {
				if (op.odds_id == schemeInfo.odds_id) {
					activeKey = item._id;
				}
			});
		});

		return <div className={globalStyles.detailContent}>
					<Form
						className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
						onSubmit={this.onSubmit}
					>
						<Card
							title="赛事信息"
							bordered={false}
						>
							<Row gutter={18}>
								<Col xl={8}>
									<p>对阵队伍：<span>{eventInfo.teams ? eventInfo.teams[0].name : '-'} <b className={globalStyles.blue}>vs</b> {eventInfo.teams ? eventInfo.teams[1].name : '-'}</span></p>
								</Col>
								<Col xl={8}>
									<p>赛事ID：<span>{eventInfo.event_id}</span></p>
								</Col>
								<Col xl={8}>
									<p>游戏类型：<span>{eventInfo.teams ? DataGames.getField(eventInfo.game_id, 'name') : '-'}</span></p>
								</Col>
								<Col xl={8}>
									<p>联赛名称：<span>{eventInfo.league ? eventInfo.league.name : '-'}</span></p>
								</Col>
								<Col xl={8}>
									<p>开赛时间：<span>{moment.unix(eventInfo.begin_time).format('YYYY-MM-DD HH:mm')}</span></p>
								</Col>
							</Row>
						</Card>
						<div className={styles.schemeInfo}>
							<Card
								title="方案信息"
								bordered={false}
							>
								<Row>
									<Col xl={12}>
										<h6 className="ant-form-item-required">方案名称：</h6>
										<FormItem label="" {...formItemLayout}>
											{getFieldDecorator('title', {
												rules: [{ required: true, message: '请输入方案名称' }],
												initialValue: schemeInfo.title
											})(
												<Input type="text" placeholder="请输入" />
											)}
										</FormItem>
									</Col>
									<Col xl={12}>
										<h6 className="ant-form-item-required">选择专家：</h6>
										<FormItem label="" {...formItemLayout}>
											{getFieldDecorator('expert_id', {
												rules: [{ required: true, message: '请选择专家' }],
												initialValue: schemeInfo.expert_id
											})(
												<Select placeholder="请选择专家">
													{this.props.expertData.map(item => (
														<Option value={item._id} key={item._id}>{item.name}</Option>
													))}
												</Select>
											)}
										</FormItem>
									</Col>
									<Col xl={24}>
										<h6 className="ant-form-item-required">推荐竞猜项：</h6>
										<Collapse defaultActiveKey={activeKey} className={styles.optionBox}>
											{spData.map(item => {
												return <Panel header={item.name} key={item._id}>
															{this.generateOpList(item, schemeInfo.odds_id)}
														</Panel>
											})}
										</Collapse>
									</Col>
									<Col xl={24}>
										<h6 className="ant-form-item-required">推荐原因：</h6>
										<FormItem label="" {...this.formItemLayout}>
											{getFieldDecorator('reason', {
												rules: [{ required: true, message: '请输入推荐原因' }],
												initialValue: schemeInfo.reason
											})(
												<TextArea
													placeholder="请输入"
													rows={10}
												/>
											)}
										</FormItem>
									</Col>
									<Col xl={12}>
										<h6>方案售价：</h6>
										<FormItem label="" {...formItemLayout}>
											{getFieldDecorator('price', {
												rules: [{ required: true, message: '请输入方案售价' }],
												initialValue: price
											})(
												<InputNumber min={0} />
											)}
											<span style={{ paddingLeft: '5px' }}>虚拟币</span>
										</FormItem>
									</Col>
									<Col xl={24}>
										<h6>设置：</h6>
										<FormItem label="" {...formItemLayout}>
											<Row type="flex" style={{flexFlow: 'row nowrap'}}>
												<Col span={6}>
													<FormItem>
														{getFieldDecorator('is_top', {
															valuePropName: 'checked',
															initialValue: schemeInfo.is_top,
														})(
															<Checkbox>置顶</Checkbox>
														)}
													</FormItem>
												</Col>
												<Col span={6}>
													<FormItem>
														{getFieldDecorator('is_hit', {
															valuePropName: 'checked',
															initialValue: schemeInfo.is_hit,
														})(
															<Checkbox>包中</Checkbox>
														)}
													</FormItem>
												</Col>
												<Col span={6}>
													<FormItem>
														{getFieldDecorator('status', {
															valuePropName: 'checked',
															initialValue: schemeInfo.status,
														})(
															<Checkbox>启用</Checkbox>
														)}
													</FormItem>
												</Col>
											</Row>
										</FormItem>
									</Col>
								</Row>
							</Card>
						</div>
						<div className={globalStyles.drawerBottom}>
							<Button className={globalStyles.mRight8} onClick={props.onClose}>取消</Button>
							<Button htmlType="submit" type="primary" loading={state.isLoading}>保存</Button>
						</div>
					</Form>
				</div>
	}
}

export default Form.create()(Edit)

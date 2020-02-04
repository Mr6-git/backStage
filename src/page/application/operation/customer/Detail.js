import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Row,
	Col,
	Tag,
	Tabs,
	Menu,
	Radio,
	Modal,
	Tooltip,
	BackTop,
	message,
	Dropdown,
	Drawer,
	Icon,
	Spin
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import { Event } from '@/utils';
import Enum, { AUTH } from '@/enum';
import NetOperation from '@/net/operation';
import NetSystem from '@/net/system';
import NetMarketing from '@/net/marketing';
import DataAgencys from '@/data/Agencys';
import DataUser from '@/data/User';
import DataMemberLevels from '@/data/MemberLevels';
import MyIcon from '@/component/MyIcon';
import Dotted from '@/component/Dotted';
import Info from './detail/Info';
import TagsModal from './detail/TagsModal';
import TransferOwner from './detail/TransferOwner';
import TransferAgency from './detail/TransferAgency';
import Pwd from './modal/Pwd';
import Coupon from './modal/Coupon';
import Source from './modal/Source';
import Deliver from './modal/Deliver';
import InoutControl from './modal/InoutControl';
import Logging from './modal/Logging';
import Feedback from './modal/Feedback';
import CustomerList from './CustomerList';
import styles from './styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const MenuItem = Menu.Item;
const TabPane = Tabs.TabPane;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			tagMap: {},
			fieldMap: [],
			agencyTree: null,
			channelName: '',
			channelList: [],
			ipList: {},
		};
	}

	componentDidMount() {
		this.setState({
			channelList: this.props.channelList
		}, () => {
			this.getData();
			this.getFieldEditor();
			this.getTagData();
		});

		if (this.props.isCompliance) {
			this.getAgencyTree();
		}
	}

	componentWillUnmount() {
		Event.emit('ValidateCloseModule', this);
	}

	getData = () => {
		const _id = this.props.id;
		NetOperation.getSingleCustomer(_id).then(res => {
			const data = res.data;
			const ipList = [];
			if (data.create_ip) ipList[0] = {ip: data.create_ip, num: 1};
			if (data.last_login_ip) ipList[1] = {ip: data.last_login_ip, num: 1};
			if (data.last_doing_ip) ipList[2] = {ip: data.last_doing_ip, num: 1};

			if (ipList.length) {
				this.getIPUserNum(ipList);
			}

			if (data.channel_id > 0) {
				this.getSingleChannel(data.channel_id);
				this.setState({
					data: data,
					ipList: ipList
				});
			} else {
				this.setState({
					data: data,
					channelName: '',
					ipList: ipList
				});
			}
			
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getSingleChannel = (channelId) => {
		let { channelList } = this.state;
		NetMarketing.getSingleChannel(channelId).then((res) => {
			let isExist = false;
			if (channelList) {
				channelList.map(item => {
					if (item._id == channelId) {
						isExist = true;
					}
				});
			} else {
				channelList = [];
			}

			if (!isExist) {
				channelList.push(res.data);
			}

			this.setState({
				channelName: res.data.name,
				channelList: channelList
			});
		}).catch((err) => {
			console.log(err);
		});
	}

	getAgencyTree() {
		DataAgencys.getTreeData(this.props.match.params.id, (data) => {
			this.setState({ agencyTree: data });
		}, true);
	}

	getTagData() {
		NetOperation.getTags().then(res => {
			const tags = res.data;
			const tagMap = {};
			if (tags.length) {
				tags.map(item => {
					tagMap[item._id] = item;
				});
			}
			this.setState({
				tagMap,
			});
		}).catch(err => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getFieldEditor = () => {
		const assort = 0;
		NetSystem.getFieldEditor(assort).then((res) => {
			const fieldMap = {};
			let fieldObject = null;
			res.data.map(item => {
				if (item.antistop == 'source') {
					fieldObject = []
					item.options.map(item => {
						fieldMap[item.pick_value] = item.pick_name;
					});
					fieldObject = item;
				}
			});
			this.setState({
				fieldMap,
				fieldObject,
			});
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
		});
	}

	getIPUserNum(ipList) {
		ipList.map((item, index) => {
			let data = {};
			switch (index) {
				case 1:
					data.filter = `last_login_ip:${item.ip}`;
					break;
				case 2:
					data.filter = `last_doing_ip:${item.ip}`;
					break;
				default:
					data.filter = `create_ip:${item.ip}`;
					break;
			}
			NetOperation.getCustomerIPTotal(data).then((res) => {
				this.state.ipList[index] = {ip: item, num: res.data.total};
				this.setState({});
			}).catch((err) => {
				
			});
		});
	}

	frozenAlert = () => {
		Modal.confirm({
			title: '确认提示',
			content: '确定冻结该客户账户吗',
			centered: true,
			onOk: () => {
				const data = {
					ids: this.props.id,
				};
				NetOperation.freezeCustomer(data).then((res) => {
					this.getData();
					this.props.getData();
					message.success('冻结成功');
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
		});
	}

	unfrozenAlert = () => {
		Modal.confirm({
			title: '确认提示',
			content: '确定解冻该客户账户吗',
			centered: true,
			onOk: () => {
				const data = {
					ids: this.props.id,
				};
				NetOperation.unfreezeCustomer(data).then((res) => {
					this.getData();
					this.props.getData();
					message.success('解冻成功');
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
		});
	}

	transferOwnerAlert = () => {
		const idList = [this.state.data._id];
		const options = {
			title: '转移至',
			height: '300px',
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
				module: <TransferOwner
							idList={idList}
							supervisorTree={this.props.supervisorTree}
							getData={() => {
								this.getData();
								this.props.getData();
							}}
						/>,
				props: options,
				parent: this
			});
	}

	transferAgencyAlert = () => {
		const idList = [this.state.data._id];
		const options = {
			title: '转移至',
			height: '300px',
			footer: null,
			centered: true,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
				module: <TransferAgency
							idList={idList}
							supervisorTree={this.state.agencyTree}
							total={1}
							getData={() => {
								this.getData();
								this.props.getData();
							}}
						/>,
				props: options,
				parent: this
			});
	}

	tagsAlert(tags) {
		const _id = this.state.data._id;
		const options = {
			title: '编辑标签',
			centered: true,
			footer: null,
			zIndex: 1001,
		}
		Event.emit('OpenModule', {
			module: <TagsModal
						id={_id}
						tags={tags}
						getData={() => {
							this.getData();
							this.getTagData();
							this.props.getData();
						}}
					/>,
			props: options, 
			parent: this
		});
	}

	resetPwd = () => {
		const options = {
			title: '修改登录密码',
			centered: true,
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Pwd
						id={this.state.data._id}
					/>,
			props: options, parent: this
		});
	}

	sendCoupon = () => {
		const options = {
			title: '赠送优惠券',
			centered: true,
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Coupon
						id={this.state.data._id}
					/>,
			props: options, parent: this
		});
	}

	editSource = () => {
		const { data, fieldObject, channelList } = this.state;
		const options = {
			title: '编辑来源',
			centered: true,
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Source
						idList={data._id}
						currentSource={data.source}
						currentChannelId={data.channel_id}
						isAllow={fieldObject ? fieldObject.status : null}
						sourceList={fieldObject ? fieldObject.options : null}
						channelList={channelList ? channelList : null}
						getData={() => {
							this.getData();
							this.props.getData();
						}}
					/>,
			props: options, parent: this
		});
	}

	deliverRedEnvelop = () => {
		const { data } = this.state;
		const options = {
			title: '发放红包',
			centered: true,
			footer: null,
			zIndex: 1001,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <Deliver
						id={data._id}
					/>,
			props: options, parent: this
		});
	}

	controlAmount = () => {
		const options = {
			title: '出入金控制',
			centered: true,
			footer: null,
			zIndex: 1001,
			width: 550,
			maskClosable: false,
		}
		Event.emit('OpenModule', {
			module: <InoutControl
						info={this.state.data}
						getData={() => {
							this.getData();
						}}
					/>,
			props: options, parent: this
		});
	}

	setInternalStaff = () => {
		Modal.confirm({
			title: '确认提示',
			// content: '确定要将该客户账户设置成测试客户吗，设置后将无法取消',
			content: '确定要将该客户账户设置成测试客户吗？',
			centered: true,
			onOk: () => {
				NetOperation.setInternalStaff(this.props.id).then((res) => {
					this.getData();
					this.props.getData();
					message.success('设置成功');
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
		});
	}

	cancelInternalStaff = () => {
		Modal.confirm({
			title: '确认提示',
			content: '确定要将该客户账户取消设置测试客户吗？',
			centered: true,
			onOk: () => {
				NetOperation.cancelInternalStaff(this.props.id).then((res) => {
					this.getData();
					this.props.getData();
					message.success('取消成功');
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
		});
	}

	getMemuData(state, data) {
		const isInternalStaff = data.is_internal_staff;
		return [
			{
				title: '修改登录密码',
				onClick: this.resetPwd,
				disabled: !this.props.checkAuth(1, AUTH.ALLOW_CUSTOMER_PASSWORD),
			}, /* {
				title: '赠送优惠券',
				onClick: this.sendCoupon,
				disabled: false,
			},  */{
				title: '编辑来源',
				onClick: this.editSource,
				disabled: (state.fieldObject && state.fieldObject.status == 1 && this.props.checkAuth(1, AUTH.ALLOW_CUSTOMER_SOURCE)) ? false : true,
			}, {
				title: '发放红包',
				onClick: this.deliverRedEnvelop,
				disabled: !this.props.checkAuth(1, AUTH.ALLOW_RED_ENVELOP)
			}, {
				title: '资金控制',
				onClick: this.controlAmount,
				disabled: !this.props.checkAuth(1, AUTH.ALLOW_CUSTOMER_CAPITAL)
			}, {
				title: !isInternalStaff ? '设为测试客户' : '取消测试客户',
				onClick: !isInternalStaff ? this.setInternalStaff : this.cancelInternalStaff,
				disabled: !this.props.checkAuth(1, AUTH.ALLOW_INTERNAL_STAFF)
			}
		];
	}

	getMenu(state, data) {
		const listData = this.getMemuData(state, data)
		return <Menu>
					{listData.map((item, index) => {
						return (
							<MenuItem
								key={item.title}
								onClick={(e) => {
									e.domEvent.stopPropagation();
									item.onClick && item.onClick();
								}}
								disabled={item.disabled}
								style={{ height: '36px', lineHeight: '30px' }}
							>
								{item.title}
							</MenuItem>
						)
					})}
				</Menu>
	}

	renderStatus(data) {
		switch (data.status) {
			case 0: return <Dotted type="grey">待审核</Dotted>;
			case 1: return <Dotted type="blue">正常</Dotted>;
			case 2: return <Dotted type="red">冻结</Dotted>;
			default: return null;
		}
	}

	open(ipaddress, type) {
		const props = this.props;
		const { assort, id, moduleId, match, history } = props;
		let url = '';
		switch (assort) {
			// 客户管理
			case 1:
				url = `${match.url}/detail/${id}/ipaddress/${ipaddress}/${type}`;
				break;
			// 合规管理
			case 2:
				url = `${match.url}/${id}/ipaddress/${ipaddress}/${type}`;
				break;
			// 赛事详情订单列表
			case 3:
				url = `${match.url}/event/${moduleId}/customer/${id}/ipaddress/${ipaddress}/${type}`;
				break;
			// 红包详情领取列表
			case 4:
				url = `${match.url}/${moduleId}/customer/${id}/ipaddress/${ipaddress}/${type}`;
				break;
			default:
				url = `${match.url}/customer/${id}/ipaddress/${ipaddress}/${type}`;
				break;
		}
		history.push(url);
	}

	onClose = () => {
		const props = this.props;
		const { assort, id, moduleId, match, history } = props;
		let url = '';
		switch (assort) {
			case 1:
				url = `${match.url}/detail/${id}`;
				break;
			case 2:
				url = `${match.url}/${id}`;
				break;
			case 3:
				url = `${match.url}/event/${moduleId}/customer/${id}`;
				break;
			case 4:
				url = `${match.url}/${moduleId}/customer/${id}`;
				break;
			default:
				url = `${match.url}/customer/${id}`;
				break;
		}
		history.push(url);
	}

	render() {
		const state = this.state;
		const props = this.props;
		const { isCompliance, assort, id } = props;
		const { data, tagMap, fieldMap, channelName, ipList } = state;

		let sex = '';
		switch (data.sex) {
			case 1: sex = '男'; break;
			case 2: sex = '女'; break;
			default: sex = '未知'; break;
		}

		if (data.province == data.city) {
			data.city = '';
		}

		let tagsNames = [];
		if (data.tags) {
			tagsNames = data.tags.split(',').map(item => {
				if (tagMap[item]) {
					return tagMap[item].name;
				}
				return '';
			});
		}

		let tagsContent = null;
		if (tagsNames.length) {
			tagsContent = tagsNames.map((tag, index) => {
				const isLongTag = tag.length > 20;
				const tagElem = (
					<Fragment key={index}>
						{tag && <Tag key={index}>{isLongTag ? `${tag.slice(0, 20)}...` : tag}</Tag>}
					</Fragment>
				);
				return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
			});
		}

		let fundsStatus = '';
		if (data.out_funds_status == 0) {
			fundsStatus = '禁止出金';
		}
		if (data.in_funds_status == 0) {
			if (fundsStatus.length > 0) {
				fundsStatus = '禁止出入金';
			} else {
				fundsStatus = '禁止入金';
			}
		}
		if (data.allow_consume == 0) {
			if (fundsStatus.length > 0) fundsStatus += '、';
			fundsStatus += '消费限制';
		}

		let isInternalStaff = '';
		if (data.is_internal_staff == 1) {
			isInternalStaff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
		}

		let isHighseas = '';
		if (data.is_highseas == 1) {
			isHighseas = <label className={classnames(globalStyles.tag, globalStyles.highseasTag)}>公海</label>;
		}

		const content = this.getMenu(state, data);

		const allowManage = props.allowManage;

		let allowFreeze = false;
		if (isCompliance) {
			allowFreeze = props.checkAuth(1, AUTH.ALLOW_OPERATE_CUSTOMER_FROZEN)
		} else {
			allowFreeze = props.checkAuth(1, AUTH.ALLOW_FREEZE_CUSTOMER);
		}
		if (data.status == 0) {
			allowFreeze = false;
		}

		let allowTransfer = false;
		if (isCompliance) {
			allowTransfer = props.checkAuth(1, AUTH.ALLOW_OPERATE_CUSTOMER_TRANSFER);
		} else {
			allowTransfer = props.checkAuth(1, AUTH.ALLOW_TRANSFER_CUSTOMER);
		}
		if (!allowManage) {
			allowFreeze = false;
			allowTransfer = false;
		}

		let source = '-';
		if (fieldMap[data.source]) {
			source = fieldMap[data.source];
		} else if (data.source > 0) {
			source = '未知(' + data.source + ')';
		}

		let riskLevel = '-';
		if (data.risk_level) {
			if (data.risk_level >= 85) {
				riskLevel = <Fragment><span style={{ color: '#FF0066' }}>高风险</span> ({data.risk_level})</Fragment>;
			} else if (data.risk_level >= 65) {
				riskLevel = <Fragment><span style={{ color: '#6633FF' }}>中高风险</span> ({data.risk_level})</Fragment>;
			} else if (data.risk_level >= 35) {
				riskLevel = <Fragment><span style={{ color: '#1890FF' }}>中风险</span> ({data.risk_level})</Fragment>;
			} else {
				riskLevel = <Fragment><span style={{ color: '#009999' }}>低风险</span> ({data.risk_level})</Fragment>;
			}
		}

		let isService = false;
		const level = DataUser.source.team.level;
		switch (level) {
			case Enum.LEVEL_PLATFORM:
			case Enum.LEVEL_OPERATOR:
			case Enum.LEVEL_SERVICE:
				isService = true;
				break;
			default:
				break;
		}

		if (!data._id) {
			return <Spin />;
		}

		let url = '';
		switch (assort) {
			case 1:
				url = `${props.match.path}/detail/:detail/ipaddress/:ipaddress/:type`;
				break;
			case 2:
				url = `${props.match.path}/:detail/ipaddress/:ipaddress/:type`;
				break;
			case 3:
				url = `${props.match.path}/event/:moduleId/customer/:detail/ipaddress/:ipaddress/:type`;
				break;
			case 4:
				url = `${props.match.path}/:moduleId/customer/:detail/ipaddress/:ipaddress/:type`;
				break;
			default:
				url = `${props.match.path}/customer/:detail/ipaddress/:ipaddress/:type`;
				break;
		}

		return <Fragment>
					<div className={globalStyles.detailWrap}>
						<Row className={globalStyles.titleBox}>
							<Col xl={16} sm={16} className={globalStyles.titleLeft}>
								<MyIcon
									type="icon-xinfeng"
									className={globalStyles.detailLogo}
								/>
								<div className={globalStyles.client}>客户ID：{data._id}</div>
								{isInternalStaff}{isHighseas}
							</Col>
							<Col xl={8} sm={8} style={{ textAlign: 'right' }}>
								{!isCompliance ? (
									<RadioGroup>
										{data.status == 2 ?
											<RadioButton value="0" onClick={this.unfrozenAlert} disabled={!allowFreeze}>解冻</RadioButton> :
											<RadioButton value="0" onClick={this.frozenAlert} disabled={!allowFreeze}>冻结</RadioButton>
										}
										<RadioButton value="1" onClick={this.transferOwnerAlert} disabled={!allowTransfer}>转移至</RadioButton>
										{allowManage ? (
											<Dropdown overlay={content}>
												<RadioButton value="2">...</RadioButton>
											</Dropdown>
										) : null}
									</RadioGroup>
								) : (
									<RadioGroup>
										{data.status == 2 ?
											<RadioButton value="0" onClick={this.unfrozenAlert} disabled={!allowFreeze}>解冻</RadioButton> :
											<RadioButton value="0" onClick={this.frozenAlert} disabled={!allowFreeze}>冻结</RadioButton>
										}
										<RadioButton value="1" onClick={this.transferAgencyAlert} disabled={!allowTransfer}>转移至</RadioButton>
										{allowManage ? (
											<Dropdown overlay={content}>
												<RadioButton value="2">...</RadioButton>
											</Dropdown>
										) : null}
									</RadioGroup>
								)}
							</Col>
						</Row>
						<Row className={globalStyles.infoBox}>
							<Col xl={19} sm={24}>
								<div className={globalStyles.infoLeft}>
									<Row gutter={20}>
										<Col xl={8} sm={12}>
											<p>客户昵称：<span>{data.nickname}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>性别：<span>{sex}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>所在地：<span>{(data.province || data.city) ? <Fragment>{data.province}&nbsp;{data.city}</Fragment> : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>来源：<span>{source}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>推广渠道：<span>{channelName ? channelName : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>客户等级：<span>{DataMemberLevels.getLevel(data.points)}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>绑定手机：<span>{(data.mobile) ? data.mobile : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>绑定邮箱：<span>{(data.email) ? data.email : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>资金控制：<span>{fundsStatus ? fundsStatus : '不限'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>归属部门：<span>{data.department_name ? data.department_name : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>归属人：<span>{data.owner_name ? data.owner_name : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>风险识别：<span>{riskLevel}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>注册时间：<span>{data.create_time ? moment.unix(data.create_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>最后登录时间：<span>{data.last_login_time ? moment.unix(data.last_login_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>最后活动时间：<span>{data.last_doing_time ? moment.unix(data.last_doing_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										{isService ? (
											<Fragment>
												<Col xl={8} sm={12}>
													<p>注册IP：<span>{data.create_ip ? <Fragment>{data.create_ip} <a onClick={() => { this.open(data.create_ip, 0) }}>({ipList[0].num})</a></Fragment> : '-'}</span></p>
												</Col>
												<Col xl={8} sm={12}>
													<p>最后登录IP：<span>{data.last_login_ip ? <Fragment>{data.last_login_ip} <a onClick={() => { this.open(data.last_login_ip, 1) }}>({ipList[1].num})</a></Fragment> : '-'}</span></p>
												</Col>
												<Col xl={8} sm={12}>
													<p>最后活动IP：<span>{data.last_doing_ip ? <Fragment>{data.last_doing_ip} <a onClick={() => { this.open(data.last_doing_ip, 2) }}>({ipList[2].num})</a></Fragment> : '-'}</span></p>
												</Col>
											</Fragment>
										) : (
											<Fragment>
												<Col xl={8} sm={12}>
													<p>注册IP：<span>{data.create_ip ? data.create_ip : '-'}</span></p>
												</Col>
												<Col xl={8} sm={12}>
													<p>最后登录IP：<span>{data.last_login_ip ? data.last_login_ip : '-'}</span></p>
												</Col>
												<Col xl={8} sm={12}>
													<p>最后活动IP：<span>{data.last_doing_ip ? data.last_doing_ip : '-'}</span></p>
												</Col>
											</Fragment>
										)}
									</Row>
								</div>
								{
									(tagsNames.length > 0 || props.checkAuth(1, AUTH.ALLOW_CUSTOMER_TAGS)) ? (
									<div className={globalStyles.tagWrap}>
										<label>客户标签：</label>
										<div className={globalStyles.tagCont}>
											{tagsContent}
											{props.checkDom(1, <Tag
												onClick={() => { this.tagsAlert(tagsNames) }}
												style={{ background: '#fff', borderStyle: 'dashed', cursor: 'pointer' }}
											>
												<Icon type="plus" /> 编辑标签
											</Tag>, AUTH.ALLOW_CUSTOMER_TAGS)}
										</div>
									</div>
								): null}
							</Col>
							<Col xl={5} sm={24}>
								<div className={globalStyles.rightBox}>
									<div className={globalStyles.rightItem}>
										<label>状态</label>
										<div>
											{this.renderStatus(data)}
										</div>
									</div>
									<div className={globalStyles.rightItem}>
										<label>机构</label>
										<div>
											{data.agency_name ? data.agency_name : '-'}
										</div>
									</div>
								</div>
							</Col>
						</Row>
					</div>
					<div className={styles.detailMain}>
						<Tabs
							defaultActiveKey="1"
							animated={{inkBar: true, tabPane: false}}
						>
							<TabPane tab="详情" key="1">
								<Info {...props} id={id} data={data} />
							</TabPane>
							<TabPane tab="访问" key="2">
								<Logging {...props} id={id} />
							</TabPane>
							<TabPane tab="客户反馈" key="3">
								<Feedback {...props} id={id} />
							</TabPane>
						</Tabs>
					</div>
					<Route
						path={url}
						children={(childProps) => {
							let ipaddress = '';
							let type = 0;
							if (childProps.match) {
								if (childProps.match.params.ipaddress) {
									ipaddress = childProps.match.params.ipaddress;
								}
								if (childProps.match.params.type) {
									type = childProps.match.params.type;
								}
							}
							return <Drawer
										title="同IP地址客户列表"
										placement="right"
										width="calc(100% - 300px)"
										visible={!!childProps.match}
										onClose={this.onClose}
										destroyOnClose={true}
										className={classnames(globalStyles.drawGap, globalStyles.grey)}
									>
										<CustomerList
											{...props}
											ipaddress={ipaddress}
											type={type}
										/>
									</Drawer>
						}}
					/>
				</Fragment>
	}
}
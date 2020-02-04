import React, { Component, Fragment } from 'react';
import { Route } from "react-router-dom";
import {
	Row,
	Col,
	Tag,
	Tabs,
	Menu,
	Radio,
	message,
	Drawer,
	Spin,
	Card
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
			if (data.create_ip) ipList[0] = { ip: data.create_ip, num: 1 };
			if (data.last_login_ip) ipList[1] = { ip: data.last_login_ip, num: 1 };
			if (data.last_doing_ip) ipList[2] = { ip: data.last_doing_ip, num: 1 };

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
				this.state.ipList[index] = { ip: item, num: res.data.total };
				this.setState({});
			}).catch((err) => {

			});
		});
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
		const { assort, id } = props;
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

		let isInternalStaff = '';
		if (data.is_internal_staff == 1) {
			isInternalStaff = <label className={classnames(globalStyles.tag, globalStyles.staffTag)}>测试</label>;
		}

		let isHighseas = '';
		if (data.is_highseas == 1) {
			isHighseas = <label className={classnames(globalStyles.tag, globalStyles.highseasTag)}>公海</label>;
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

		const allowManage = props.allowManage;

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
					<Col xl={8} sm={8} style={{ textAlign: 'right' }}></Col>
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
									<p>注册时间：<span>{data.create_time ? moment.unix(data.create_time).format('YYYY-MM-DD HH:mm') : '-'}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>最后登录时间：<span>{data.last_login_time ? moment.unix(data.last_login_time).format('YYYY-MM-DD HH:mm') : '-'}</span></p>
								</Col>
								<Col xl={8} sm={12}>
									<p>最后活动时间：<span>{data.last_doing_time ? moment.unix(data.last_doing_time).format('YYYY-MM-DD HH:mm') : '-'}</span></p>
								</Col>
								{isService ? (
									<Fragment>
										<Col xl={8} sm={12}>
											<p>注册IP：<span>{data.create_ip ? <Fragment>{data.create_ip} ({ipList[0].num})</Fragment> : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>最后登录IP：<span>{data.last_login_ip ? <Fragment>{data.last_login_ip} ({ipList[1].num})</Fragment> : '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>最后活动IP：<span>{data.last_doing_ip ? <Fragment>{data.last_doing_ip}({ipList[2].num})</Fragment> : '-'}</span></p>
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
			<Info {...props} id={id} data={data} />
		</Fragment>
	}
}
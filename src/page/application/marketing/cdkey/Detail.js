import React, { Component, Fragment } from 'react';
import {
	Row,
	Col,
	Icon,
	Tabs,
	Menu,
	Modal,
	Button,
	message,
	Dropdown,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import utils, { Event } from '@/utils';
import { AUTH } from '@/enum';
import NetMarketing from '@/net/marketing';
import MyIcon from '@/component/MyIcon';
import Edit from './Edit';
import GetList from './detail/GetList';
// import Deliver from './Deliver';
import Dotted from '@/component/Dotted';
import globalStyles from '@/resource/css/global.module.less';

const MenuItem = Menu.Item;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;

export default class extends Component {
	constructor(props) {
		super(props);
		this.state = {
			info: {},
			appList: {},
		}
	}

	componentWillMount() {
		this.getData();
	}

	// 防止组件销毁后设置state，导致内存泄漏的错误
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return;
		}
	}	

	getData = () => {
		NetMarketing.getSingleCode(this.props.id).then(res => {
			this.setState({
				info: res.data,
			})
		}).catch(err => {
			message.error(err.msg)
		});
	}

	okCallback = () => {
		this.props.okCallback(true);
		this.getData();
	}

	stopPropagation = (e) => {
		e.stopPropagation();
	}

	getMemuData(state) {
		const { info } = state;
		const isEdit = (info.status >= 2 || !this.props.checkAuth(4));
		return [
			{
				title: !info.status ? '启用' : '禁用',
				icon: '',
				key: 4,
				onClick: this.doEnabled,
				disabled: isEdit
			},
		];
	}

	doEnabled = () => {
		const { info } = this.state;
		const param = (!info.status) ? 'enabled' : 'disabled';
		const title = (!info.status) ? '确定要启用该激活码吗？' : '确定要禁用该激活码吗？';
		Modal.confirm({
			title: '确认提示',
			content: title,
			width: '450px',
			centered: true,
			onOk: () => {
				NetMarketing.tagInviteCode(this.props.id, param).then((res) => {
					// data.status = !data.status;
					message.success('操作成功');
					this.getData();
				}).catch((err) => {
					if (err.msg) {
						message.error(err.msg);
					}
				});
			},
			onCancel() {},
		});
	}

	getMenu(state) {
		const listData = this.getMemuData(state)

		return <Menu>
					{listData.map((item, index) => {
						// const disabled = this.props.checkAuth(item.key);
						const disabled = item.disabled ? true : false;
						return (
							<MenuItem
								key={item.title}
								onClick={(e) => {
									e.domEvent.stopPropagation();
									item.onClick && item.onClick();
								}}
								disabled={disabled}
								style={{ height: '36px', lineHeight: '30px' }}
							>
								{item.title}
							</MenuItem>
						)
					})}
				</Menu>
	}

	renderStatus(data) {
		switch (data) {
			case 0: return <Dotted type="grey">禁用</Dotted>;
			case 1: return <Dotted type="blue">启用</Dotted>;
			default: return null;
		}
	}

	render() {
		const state = this.state;
		const props = this.props;
		const { info } = state;

		let remainder = info.remainder;
		if (info.status == 3) {
			remainder = 0;
		}

		const popContent = this.getMenu(state);

		return <Fragment>
					<div className={globalStyles.detailWrap}>
						<Row className={globalStyles.titleBox}>
							<Col xl={16} sm={18} className={globalStyles.titleLeft}>
								<MyIcon
									type="icon-xinfeng"
									className={globalStyles.detailLogo}
								/>
								<div className={globalStyles.client}>
									批次号：{info._id}
								</div>
							</Col>
							<Col xl={8} sm={6} style={{ textAlign: 'right' }}>
								<Dropdown overlay={popContent}>
									<ButtonGroup onClick={this.stopPropagation}>
										<Button>
											操作
										</Button>
										<Button>
											...
										</Button>
									</ButtonGroup>
								</Dropdown>
							</Col>
						</Row>
						<Row className={globalStyles.infoBox}>
							<Col xl={19} sm={24}>
								<div className={globalStyles.infoLeft}>
									<Row gutter={20}>
										<Col xl={8} sm={12}>
											<p>关联红包：<span>{info.red_envelop_name}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>注册时间：<span>{info.registered_time ? moment.unix(info.registered_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>创建时间：<span>{info.create_time ? moment.unix(info.create_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>激活时间：<span>{info.activation_time ? moment.unix(info.activation_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>过期时间：<span>{info.expire_time ? moment.unix(info.expire_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
									</Row>
								</div>
							</Col>
							<Col xl={5} sm={24}>
								<div className={globalStyles.rightBox}>
									<div className={globalStyles.rightItem}>
										<label>状态</label>
										<div>
											{this.renderStatus(info.status)}
										</div>
									</div>
								</div>
							</Col>
						</Row>
					</div>
					<Tabs
						defaultActiveKey="1"
						animated={{inkBar: true, tabPane: false}}
					>
						<TabPane tab="领取列表" key="1">
							<GetList {...props} id={props.id} info={info} />
						</TabPane>
					</Tabs>
				</Fragment>
	}
}

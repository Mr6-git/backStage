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
import Append from './Append';
import Deliver from './Deliver';
import ReceiveLog from './detail/ReceiveLog';
import OperatorLog from './detail/OperatorLog';
import styles from '../styles.module.less';
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
		NetMarketing.getRedEnvelopInfo(this.props.id).then(res => {
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

	edit = () => {
		const props = this.props;
		const { info, appList } = this.state;
		const options = {
			title: '编辑红包',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1002,
		}
		Event.emit('OpenModule', {
			module: <Edit
						{...info}
						appList={appList}
						okCallback={this.okCallback}
					/>,
			props: options,
			parent: this
		});
	}

	append = () => {
		const { info } = this.state;
		const options = {
			title: '追加红包',
			width: 640,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1002,
		}
		Event.emit('OpenModule', {
			module: <Append
						{...info}
						okCallback={this.okCallback}
					/>,
			props: options,
			parent: this
		});
	}

	deliver = () => {
		const { info } = this.state;
		const options = {
			title: '发放红包',
			width: 500,
			footer: null,
			centered: true,
			maskClosable: false,
			zIndex: 1002,
		}
		Event.emit('OpenModule', {
			module: <Deliver
						{...info}
						okCallback={this.okCallback}
					/>,
			props: options,
			parent: this
		});
	}

	doEnabled = () => {
		const { info } = this.state;
		const param = (!info.status) ? 'enabled' : 'disabled';
		const title = (!info.status) ? '确定要启用该红包吗？' : '确定要禁用该红包吗？';
		Modal.confirm({
			title: '确认提示',
			content: title,
			width: '450px',
			centered: true,
			onOk: () => {
				NetMarketing.enabledRedEnvelop(info._id, param).then((res) => {
					info.status = !info.status;
					message.success('操作成功');
					this.props.okCallback(true);
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

	doRecovery = () => {
		const { info } = this.state;
		Modal.confirm({
			title: '确认提示',
			content: '确定要回收该红包吗？',
			width: '450px',
			centered: true,
			onOk: () => {
				NetMarketing.recoveryRedEnvelop(info._id).then((res) => {
					info.status = 3;
					message.success('操作成功');
					this.props.okCallback(true);
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

	getMemuData(state) {
		const { info } = state;
		const isEdit = (info.status >= 2 || !this.props.checkAuth(4));
		const isRecovery = (info.status >= 1 || info.remainder == 0 || !this.props.checkAuth(4));
		const isSend = !this.props.checkAuth(1, AUTH.ALLOW_RED_ENVELOP);
		return [
			{
				title: '编辑',
				icon: '',
				key: 4,
				onClick: this.edit,
				disabled: isEdit
			}, {
				title: !info.status ? '启用' : '禁用',
				icon: '',
				key: 4,
				onClick: this.doEnabled,
				disabled: isEdit
			}, {
				title: '追加',
				icon: '',
				key: 2,
				onClick: this.append,
				disabled: isEdit,
			}, {
				title: '发放',
				icon: '',
				key: 4,
				onClick: this.deliver,
				disabled: isSend
			}, {
				title: '回收',
				icon: '',
				key: 4,
				onClick: this.doRecovery,
				disabled: isRecovery
			}
		];
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
									红包ID：{info._id}
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
											<p>红包名称：<span>{info.title}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>面额：<span>{utils.formatMoney(info.amount / 100)}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>红包类型：<span>普通</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>发行数量：<span>{utils.formatMoney(remainder, 0)}/{utils.formatMoney(info.issued, 0)}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>创建时间：<span>{info.create_time ? moment.unix(info.create_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>最后更新时间：<span>{info.update_time ? moment.unix(info.update_time).format('YYYY-MM-DD HH:mm'): '-'}</span></p>
										</Col>
										<Col xl={8} sm={12}>
											<p>领取有效天数：<span>{info.receive_expire_day ? info.receive_expire_day + '天': '-'}</span></p>
										</Col>
									</Row>
								</div>
							</Col>
						</Row>
					</div>
					<Tabs
						defaultActiveKey="1"
						animated={{inkBar: true, tabPane: false}}
					>
						<TabPane tab="领取列表" key="1">
							<ReceiveLog {...props} id={props.id} info={info} />
						</TabPane>
						<TabPane tab="日志" key="2">
							<OperatorLog {...props} id={props.id} />
						</TabPane>
					</Tabs>
				</Fragment>
	}
}

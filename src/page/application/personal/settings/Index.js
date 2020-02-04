import React, { Component } from 'react';
import {
	Row,
	Col,
	Form,
	Card,
	Modal,
	Input,
	Button,
	message
} from 'antd';
import { Event } from '@/utils';
import Pwd from './modal/Pwd';
import Phone from './modal/Phone';
import Email from './modal/Email';
import Wechat from './modal/Wechat';
import DataUser from '@/data/User';
import DataMember from '@/data/Member';
import NetAccount from '@/net/account';
import AccountCheck from './modal/AccountCheck';
import Dingding from './modal/Dingding';
import MyAvatar from '@/component/MyAvatar';
import globalStyles from '@/resource/css/global.module.less';
import styles from '../style.module.less';
import NetSystem from '@/net/system';

const FormItem = Form.Item;
const { TextArea } = Input;

class InfoForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			nickname: DataUser.source.nickname,
			phone: DataUser.source.mobile,
			email: DataUser.source.email,
			securityToken: '',
			wechat: '',
			isPwdCheck: false,
			isPhoneCheck: false,
			isEmailCheck: false,
			isWechatCheck: false
		};
	}

	componentWillMount() {
		this.loadData();
	}

	accountCheck = (type) => {
		const state = this.state;
		let title = '修改密码';
		let key = 'isPwdCheck';
		let types = 3;
		switch (type) {
			case 'phone': title = `${!state.phone ? '绑定' : '更换'}手机`; key = 'isPhoneCheck'; types = !state.phone ? 1 : 2; break;
			case 'email': title = `${!state.email ? '绑定' : '更换'}邮箱`; key = 'isEmailCheck'; types = !state.email ? 1 : 2; break;
			case 'wechat': title = '关联钉钉'; key = 'isDingdingCheck'; break;
			default: break;
		}
		const options = {
			title: title,
			footer: null,
			maskClosable: false,
		}

		const data = DataUser.source;
		Event.emit('OpenModule', { module: <AccountCheck data={data} onCallBack={this.userVerifyed} keyType={key} types={types} />, props: options, parent: this });
	}

	//关联钉钉
	accountDing = () => {
		const options = {
			title: '绑定钉钉账户',
			footer: null,
			maskClosable: false,
		}
		Event.emit('OpenModule', { module: <Dingding ok={this.bindDing} />, props: options, parent: this });
	}

	bindDing = () => {
		this.props.history.push(this.props.match.url);
	}

	userVerifyed = (key, token) => {
		this.setState({
			securityToken: token,
			[key]: true
		}, () => {
			if (key === 'isWechatCheck') {
				this.handleWechat();
			}
		})
	}

	handleDingding = () => {
		const _this = this;
		Modal.confirm({
			title: '确定要解除钉钉绑定吗？',
			content: '解除后，您将不能用钉钉扫码登录',
			okText: '确定',
			cancelText: '取消',
			centered: true,
			onOk() { 
				_this.unbundleDingding();
			},
			onCancel() { },
		});
	}
	//解绑钉钉
	unbundleDingding = () => {
		NetSystem.unBindDingding().then((res) => {
			message.success('解绑成功');
			this.loadData();
			DataMember.getForceData();
		}).catch((res) => {
			message.error(res.msg);
		})
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const userData = DataUser.source;
		this.props.form.validateFields((err, values) => {
			const data = {
				nickname: values.nickname,
				desc: values.desc,
			}
			if (!err) {
				if ((userData.desc === values.desc) && (userData.nickname === values.nickname)) {
					return message.info('没有可更新的内容')
				}
				NetAccount.putPersonal(data).then((res) => {
					message.success('修改成功');
					Event.emit('Nikename', values.nickname);
					this.loadData();
					DataMember.getForceData();
				}).catch((res) => {
					message.error(res.msg);
				})
			}
		});
	}
	loadData() {
		DataUser.getForceData().then(() => {
			this.setState({});
		});
	}
	upDate = (key) => {
		this.setState({
			[key]: false,
		})
		this.loadData()
	}

	renderCardInfo() {
		const data = DataUser.source;
		return <div className={styles.rightInfo}>
					<div className={styles.rightTitle}>卡片</div>
					<Card
						className={styles.rightCard}
						bodyStyle={{ display: 'flex', minWidth: '380px', padding: '20px 25px' }}
					>
						<MyAvatar member={data} style={{ margin: '0 25px 0 0', fontSize: '24px' }} size={64} />
						<div className={styles.cardInfo}>
							<div className={styles.infoTitle}>{data.nickname}</div>
							<p>{data.email}</p>

							<div>状态：{data.status === 0 ? '禁用' : '启用'}</div>
							<p>角色：{data.role.name}</p>

							<div>服务商：{data.team.alias ? data.team.alias : '-'}</div>
							<div>部门：{data.department.name ? data.department.name : '-'}</div>
							<div>主管：{data.reports_to.name ? data.reports_to.name : '-'}</div>
							<div>职位：{data.position ? data.position : '-'}</div>
						</div>
					</Card>
				</div>
	}

	render() {
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		const data = DataUser.source;
		return <div className={styles.setting}>
					<h2>基本设置</h2>
					<div className={styles.setContent}>
						<div className={globalStyles.inputGap}>
							<Row gutter={24}>
								<Col span={8} className={styles.colLeft}>
									<Form onSubmit={this.handleSubmit}>
										<FormItem>
											<label>昵称</label>
											{getFieldDecorator('nickname', {
												initialValue: data.nickname,
												rules: [{ required: true, message: '请输入昵称' }]
											})(
												<Input type="text" autoFocus={true} />
											)}
										</FormItem>
										<FormItem>
											<label>个人描述（非必填）</label>
											{getFieldDecorator('desc', {
												initialValue: data.desc,
											})(
												<TextArea
													placeholder="描述一下吧..."
													rows={4}
												/>
											)}
										</FormItem>
										<Button
											type="primary"
											htmlType="submit"
											style={{ marginBottom: '24px' }}
										>更新信息</Button>
									</Form>
								</Col>
								<Col span={14}>
									{this.renderCardInfo()}
								</Col>
							</Row>
							<Row gutter={24}>
								<Col span={8}>
									<FormItem>
										<label>密码</label><br />
										{state.isPwdCheck ?
											<Pwd onCallBack={this.upDate} token={state.securityToken} /> :
											<Button onClick={() => {
												this.accountCheck('pwd');
											}}>修改密码</Button>}
									</FormItem>
									<FormItem>
										<label>手机</label>
										<Input type="text" value={data.mobile} disabled placeholder={data.mobile ? '' : '未绑定'} style={{ marginBottom: '13px' }} />
										{!data.mobile && <div className={styles.inputTip}>绑定后，可通过手机号找回密码</div>}
										{state.isPhoneCheck ?
											<Phone phone={data.mobile} onCallBack={this.upDate} token={state.securityToken} /> :
											<Button onClick={() => { this.accountCheck('phone'); }}>
												{data.mobile ? '更换号码' : '添加绑定'}
											</Button>}
									</FormItem>
									<FormItem>
										<label>邮箱</label>
										<Input type="text" value={data.email} disabled placeholder={data.email ? '' : '未绑定'} style={{ marginBottom: '13px' }} />
										{!data.email && <div className={styles.inputTip}>绑定后，可通过邮箱找回密码</div>}
										{state.isEmailCheck ?
											<Email email={data.email} onCallBack={this.upDate} token={state.securityToken} /> :
											<Button onClick={() => { this.accountCheck('email'); }}>
												{data.email ? '更换邮箱' : '添加绑定'}
											</Button>}
									</FormItem>
									<FormItem>
										<label>关联钉钉</label>
										<Input type="text" value={data.dingtalk_nick} placeholder={data.dingtalk_nick?'':'未绑定'} disabled />
										<div className={styles.inputTip}>绑定后，可直接使用钉钉登录</div>
										{data.dingtalk_nick != '' && data.dingtalk_nick != undefined ? (<Button onClick={this.handleDingding}>解绑</Button>) :
											(<Button onClick={this.accountDing}>绑定</Button>)
										}
									</FormItem>
								</Col>
							</Row>
						</div>
					</div>
				</div>;
	}
}

export default Form.create()(InfoForm);

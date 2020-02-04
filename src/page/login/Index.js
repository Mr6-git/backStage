import React, { Component, Fragment } from 'react';
import DDlogin from 'ddlogin-react'
import Module from '@/component/Module';
import MyIcon from '@/component/MyIcon';
import Captcha from '@/component/Captcha';
import NetCommon from '@/net/common';
import NetSystem from '@/net/system';

import logo from '@/resource/images/logo.png'

import {
	Tabs,
	Input,
	Form,
	Checkbox,
	Button,
	Icon,
	Avatar,
	message,
	Alert
} from 'antd';
import styles from '@/resource/css/login.module.less';
import Ding from './DingModal';
import { Event } from '@/utils';

const InputGroup = Input.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

class LoginForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: '0',
			showCaptcha: false,
			loading: false,
			username: localStorage.getItem('username') || '',
			dingFlag: false,
			modalFlag: false,
			resetPwdFlag: false,
			id: '',
			team_id: ''
		};
		this.tabs = [
			{
				key: '0',
				title: '账户密码登录',
			}, {
				key: '1',
				title: '钉钉登录',
			},
		]
	}

	componentDidMount() {
		this.inItDing();
	}

	inItDing = () => {
		var callbackUrl = `${process.env.REACT_APP_API}/callback/dingtalk/login`;
		var redirectUri = encodeURIComponent(`${callbackUrl}?type=scan`);
		var goto = encodeURIComponent(`https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${process.env.REACT_APP_DINGTALK_APPID}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=` + redirectUri)

		var obj = DDLogin({
			id: "login_container",//这里需要你在自己的页面定义一个HTML标签并设置id，例如<div id="login_container"></div>或<span id="login_container"></span>
			goto: goto, //请参考注释里的方式
			style: "border:none;background-color:#FFFFFF;",
			width: "365",
			height: "400"
		});

		var handleMessage = function (event) {
			var origin = event.origin;
			if (origin == "https://login.dingtalk.com") { //判断是否来自ddLogin扫码事件。
				var loginTmpCode = event.data; //拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
				window.location.href = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${process.env.REACT_APP_DINGTALK_APPID}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${callbackUrl}?type=login&loginTmpCode=` + loginTmpCode
			}
		};
		if (typeof window.addEventListener != 'undefined') {
			window.addEventListener('message', handleMessage, false);
		} else if (typeof window.attachEvent != 'undefined') {
			window.attachEvent('onmessage', handleMessage);
		}

		let modalFlag = this.getParams('modal');
		if (modalFlag != null && modalFlag == 1) {
			const options = {
				title: '绑定钉钉',
				width: 570,
				footer: null,
				centered: true,
				maskClosable: false,
			}
			Event.emit('OpenModule', {
				module: <Ding
					bindSuccess={this.bindSuccess}
					bindFailed={this.bindFailed}
				/>,
				props: options,
				parent: this
			});
		}
	}
	//绑定钉钉成功
	bindSuccess = (id) => {
		this.props.history.push(`/team/${id}`);
	}
	//绑定钉钉失败(310)
	bindFailed = (obj) => {
		this.setState({
			resetPwdFlag: true,
			team_id: obj.data.team_id,
			id: obj.data.id
		})
	}
	getParams = (name) => {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] === name) {
				return pair[1]
			}
		}
		return null;
	}

	onChange = (data) => {
	}

	handleTab = (key) => {
		this.setState({
			activeTab: key,
		});
		if (key == 1) {
			this.setState({
				dingFlag: true,
			});
		} else {
			this.setState({
				dingFlag: false,
			});
		}
	}

	async login(values) {
		let account = values.name.split('@');
		let team_no = '0';
		if (account.length == 2) {
			team_no = account[1];
		}
		let data = {
			name: account[0],
			team_no: team_no,
			password: values.password,
			captcha_code: values.captcha_code || ''
		};

		this.state.loading = true;
		this.setState({});
		let res = await NetCommon.login(data).then((res) => {
			if (values.rememberName) {
				localStorage.setItem('username', values.name);
			} else {
				localStorage.removeItem('username');
			}
			message.success('登录成功');
			this.props.history.push(`/team/${res.data.team_id}`);
			return res;
		}).catch((res) => {
			this.elemCaptcha && this.elemCaptcha.getSrc()
			message.error(res.msg);
			return res;
		})

		if (res.code == 200) return;
		this.state.loading = false;
		if (res.code == 304) {
			this.state.showCaptcha = true
		}
		if (res.code == 310) {
			this.setState({
				resetPwdFlag: true
			})
			return;
		}
		this.setState({});
	}

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.loading) return;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.login(values);
			}
		});
	}

	//修改密码
	amendPwd = (e) => {
		e.preventDefault();
		if (this.state.loading) return;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (values.newPwd == values.oldPwd) {
					const formData = {
						"password": values.newPwd
					}
					this.editMemberPwd(formData)
				} else {
					message.error('两次输入密码不一致');
				}
			}

		});
	}

	editMemberPwd = (data) => {
		const { id, team_id } = this.state;
		NetSystem.resetPwd(team_id, data).then(res => {
			if (res.code == 200) {
				this.setState({
					resetPwdFlag: false
				})
			} else {
				message.error(rej.msg);
			}
		}).catch(rej => {
			message.error(rej.msg);
		})
	}

	renderWechat() {
		return <Fragment>
			<div id="login_container"></div>
		</Fragment>
	}

	renderCaptcha() {
		if (this.state.showCaptcha) {
			const { getFieldDecorator } = this.props.form;
			return <FormItem>
				<InputGroup>
					{getFieldDecorator('captcha_code', {
						rules: [{ required: true, message: '请输入验证码' }]
					})(
						<Input
							placeholder="验证码"
							maxLength="4"
							prefix={<Icon type="mail" style={{ color: '#999' }} />}
							size="large"
							style={{ width: 240, marginRight: 5 }}
						/>
					)}
					<Captcha ref={(instance) => this.elemCaptcha = instance} width="120" height="40" />
				</InputGroup>
			</FormItem>;
		}
	}

	renderService() {
		const { getFieldDecorator } = this.props.form;
		return <Fragment>
			<FormItem>
				{getFieldDecorator('name', {
					rules: [
						{ required: true, message: '请输入账户' }
					],
					initialValue: this.state.username
				})(
					<Input
						placeholder="账户"
						prefix={<Icon type="user" style={{ color: '#999' }} />}
						autoComplete="off"
						size="large"
					/>
				)}
			</FormItem>
			<FormItem>
				{getFieldDecorator('password', {
					rules: [{ required: true, message: '请输入密码' }]
				})(
					<Input
						type="password"
						placeholder="密码"
						prefix={<Icon type="lock" style={{ color: '#999' }} />}
						size="large"
					/>
				)}
			</FormItem>
			{this.renderCaptcha()}
			<div className={styles.boxBottom}>
				{getFieldDecorator('rememberName', {
					valuePropName: 'checked',
					initialValue: !!this.state.username
				})(
					<Checkbox>记住用户名</Checkbox>
				)}
				<a href="javascript:;" className={styles.pwdBtn} tabIndex="-1">忘记密码</a>
			</div>
		</Fragment>
	}

	description = () => {
		return <Fragment>
			<p>没想到密码这么简单，很容易被他人获取，为了您的账户安全，请重置密码。</p>
			<p style={{ margin: '20px 0 0 0' }}>友情提示：建议采用密码+数字至少8位数的密码，例如Test9527,您还可以进入后台的【个人中心】绑定钉钉，绑定成功后，使用钉钉APP扫码登录系统，而无需输入账和密码，贴心服务值得尝试:-)</p>
		</Fragment>
	}

	renderReset() {
		const { getFieldDecorator } = this.props.form;
		return <Fragment>
					<h3 className={styles.resetTitle}>重置密码</h3>
					<div style={{ marginBottom: '30px' }}>
						<Alert
							message="密码过于简单"
							description={this.description()}
							type="error"
							showIcon
						/>
					</div>
					<FormItem>
						{getFieldDecorator('oldPwd', {
							rules: [
								{ required: true, message: '请输入新密码' }
							],
						})(
							<Input
								type="password"
								placeholder="请输入新密码"
								size="large"
							/>
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('newPwd', {
							rules: [{ required: true, message: '请输入新密码' }]
						})(
							<Input
								type="password"
								placeholder="请输入新密码"
								size="large"
							/>
						)}
					</FormItem>
				</Fragment>
	}

	render() {
		const { dingFlag, resetPwdFlag } = this.state;
		return <div className={styles.loginWrap}>
			<div className={styles.loginContent}>
				<div className={styles.title}>
					<Avatar shape="square" size={50} src={logo} style={{ marginLeft: '0' }} />
					<span>聚水塔控制台</span>
				</div>
				<div className={styles.dingd} style={{ display: dingFlag ? 'block' : 'none' }}><div id="login_container"></div></div>
				{resetPwdFlag == false ? (
					<Form onSubmit={this.handleSubmit}>
						<div className={styles.loginBox}>
							<Tabs
								size="large"
								animated={false}
								style={{ textAlign: 'center' }}
								onChange={this.handleTab}
							>
								{this.tabs.map(item =>
									<TabPane tab={item.title} key={item.key}>
										{Number(this.state.activeTab) === 0 ?
											this.renderService() : (<div className={styles.dingBg}></div>)}
									</TabPane>)}
							</Tabs>
							{dingFlag == false &&
								(<Button
									ref={(instance) => this.button = instance}
									type="primary"
									htmlType="submit"
									size="large"
									loading={this.state.loading}
									className={styles.btnSubmit}
									style={{ width: '100%', marginTop: '30px', fontSize: '18px' }}
								>登录</Button>)
							}
						</div>
					</Form>
				) :
					(
						<Fragment>
							<Form onSubmit={this.amendPwd}>
								<div className={styles.loginBox}>
									{this.renderReset()}
									<Button
										ref={(instance) => this.button = instance}
										type="primary"
										htmlType="submit"
										size="large"
										loading={this.state.loading}
										className={styles.btnSubmit}
										style={{ width: '100%', marginTop: '10px', fontSize: '18px' }}
									>更新密码</Button>
								</div>
							</Form>
						</Fragment>
					)
				}
			</div>
			<div className={styles.footer}>&copy; 2019 峰晔互娱 - AWT Team <a href="http://www.beian.miit.gov.cn" target="_blank" style={{ marginLeft: '12px', color: '#666666' }}>琼ICP备19000519号-3</a></div>
			<Module />
		</div>
	}
}

export default Form.create()(LoginForm);

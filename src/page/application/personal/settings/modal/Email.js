import React, { Component } from 'react';
import {
	Form,
	Input,
	Button,
	message
} from 'antd';
import classnames from 'classnames';
import NetAccount from '@/net/account';
import styles from '../../style.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Email extends Component {
	state = {
		dlgTipTxt: '获取验证码',
		countdown: 59,
		loading: false
	}
	canClick = true;
	reSend = false;
	timer = null;

	componentWillUnmount() {
		this.timer && clearInterval(this.timer)
	}

	upDateEmail = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					mail: values.newemail,
					code: values.code,
					security_token: this.props.token
				}

				this.setState({ loading: true })
				NetAccount.putEmail(data).then((res) => {
					message.success('操作成功');
					this.setState({ loading: false })
					this.props.onCallBack('isEmailCheck')
				}).catch((res) => {
					message.error(res.msg);
					this.setState({ loading: false })
				})
			}
		});
	}

	handleClick = () => {
		if (this.reSend) {
			this.reSendEmail();
		} else {
			this.getEmail()
		}
	}

	getEmail() {
		if (!this.canClick) return
		const mail = this.props.form.getFieldValue('newemail');
		const error = this.props.form.getFieldError('newemail');
		if (error) return
		if (!mail) {
			message.error('请输入新邮箱');
			return
		}
		const data = {
			mail,
			type: this.props.email ? 2 : 1,
		};

		this.canClick = false;
		NetAccount.emailSend(data).then((res) => {
			message.success('验证码已发送至你的邮箱，请到邮箱中查收');
			this.countdownTick();
		}).catch((res) => {
			message.error(res.msg);
			this.canClick = true
		})
	}

	reSendEmail() {
		if (!this.canClick) return
		const mail = this.props.form.getFieldValue('newemail');
		const error = this.props.form.getFieldError('newemail');
		if (error) return
		if (!mail) {
			message.error('请输入新邮箱');
			return
		}

		this.canClick = false;
		NetAccount.emailResend({mail}).then((res) => {
			message.success('验证码已发送至你的邮箱，请到邮箱中查收');
			this.countdownTick();
		}).catch((res) => {
			message.error(res.msg);
			this.canClick = true
		})
	}

	// 倒计时
	countdownTick() {
		let countdown = this.state.countdown;
		this.timer = setInterval(() => {
			countdown --;
			if (countdown < 60) {
				this.setState(preState => ({
					dlgTipTxt: `${preState.countdown}秒`,
					countdown
				}));
			}
			if (countdown < 0) {
				clearInterval(this.timer);
				countdown = 59;
				this.setState({
					dlgTipTxt: '重新获取',
					countdown,
				});
				this.reSend = true;
				this.canClick = true
			}
		}, 1000);
	}

	render() {
		const email = this.props.email;
		const { dlgTipTxt } = this.state;
		const { getFieldDecorator } = this.props.form;
		return <Form onSubmit={this.upDateEmail} className={classnames(styles.alertForm, globalStyles.inputGap)}>
					{/* {email && (
						<FormItem className={styles.formItem}>
							<Input type="text" value={email} disabled />
						</FormItem>
					)} */}
					<FormItem className={styles.formItem}>
						{getFieldDecorator('newemail', {
							rules: [
								{ required: true, message: '请输入新邮箱' },
								{ pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message:'格式不正确' },
							]
						})(
							<Input type="text" placeholder="请输入新邮箱" />
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('code', {
							rules: [{ required: true, message: '请输入验证码' }]
						})(
							<Input type="text" placeholder="6位验证码" style={{ width: '130px',marginRight: '16px' }} />
						)}
						<Button onClick={this.handleClick} style={{ minWidth: 102 }}>{dlgTipTxt}</Button>
					</FormItem>
					<FormItem style={{ marginBottom: '0' }}>
						<Button type="primary" htmlType="submit" loading={this.state.loading}>
							{ email ? '更新邮箱' : '绑定邮箱' }
						</Button>
					</FormItem>
				</Form>;
	}
}

export default Form.create()(Email);

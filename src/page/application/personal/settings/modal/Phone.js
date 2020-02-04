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

class Phone extends Component {
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

	upDatePhone = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					mobile: values.mobile,
					code: values.code,
					security_token: this.props.token
				}
				this.setState({ loading: true })
				NetAccount.putMobile(data).then((res) => {
					message.success('操作成功');
					this.setState({ loading: false })
					this.props.onCallBack('isPhoneCheck')
				}).catch((res) => {
					message.error(res.msg);
					this.setState({ loading: false })
				})
			}
		});
	}

	handleClick = () => {
		if (this.reSend) {
			this.rendSMS();
		} else {
			this.getSMS()
		}
	}

	getSMS = () => {
		if (!this.canClick) return;
		const mobile = this.props.form.getFieldValue('mobile');
		const error = this.props.form.getFieldError('mobile');
		if (error) return
		if (!mobile) {
			message.error('请输入新手机号');
			return
		}
		const data = {
			mobile,
			type: this.props.phone ? 2 : 1,
		};

		NetAccount.smsSend(data).then((res) => {
			message.success(`验证码已发送至${mobile}，请注意查收`);
			this.countdownTick();
		}).catch((res) => {
			message.error(res.msg);
			this.canClick = true
		})
	}

	rendSMS = () => {
		if (!this.canClick) return;
		const mobile = this.props.form.getFieldValue('mobile');
		const error = this.props.form.getFieldError('mobile');
		if (error) return
		if (!mobile) {
			message.error('请输入新手机号');
			return
		}

		NetAccount.smsResend({mobile}).then((res) => {
			message.success(`验证码已发送至${mobile}，请注意查收`);
			this.countdownTick();
		}).catch((res) => {
			message.error(res.msg);
			this.canClick = true
		})
	}

	// 倒计时
	countdownTick() {
		let countdown = this.state.countdown;
		this.canClick = false;
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
		const phone = this.props.phone;
		const { dlgTipTxt, loading } = this.state;
		const { getFieldDecorator } = this.props.form;
		return <Form onSubmit={this.upDatePhone} className={classnames(styles.alertForm, globalStyles.inputGap)}>
					{/* {phone && (
						<FormItem className={styles.formItem}>
							<Input type="text" value={phone} disabled />
						</FormItem>
					)} */}
					<FormItem className={styles.formItem}>
						{getFieldDecorator('mobile', {
							rules: [{ required: true, message: '请输入新手机号' },
							{ pattern: /^(((1[3456789]{1}))+\d{9})$/, message:'格式不正确' }]
						})(
							<Input type="text" placeholder="请输入新手机号" />
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
						<Button type="primary" htmlType="submit" loading={loading}>
							{ phone ? '更新号码' : '绑定号码' }
						</Button>
					</FormItem>
				</Form>;
	}
}

export default Form.create()(Phone);

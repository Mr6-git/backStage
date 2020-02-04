import React, { Component } from 'react';
import {
	Form,
	Input,
	Button,
	Select,
	message
} from 'antd';
import utils from '@/utils'
import classnames from 'classnames';
import NetAccount from '@/net/account';
import styles from '../../style.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;

class AccountCheck extends Component {
	state = {
		showTip: false,
		tips: '',
		dlgTipTxt: '获取验证码',
		countdown: 59,
	}
	timer = null;
	canClick = true;
	formWrapperCol = {span: 18}

	componentWillUnmount() {
		this.timer && clearInterval(this.timer)
	}

	handlePhone = (e) => {
		e.preventDefault()
		// this.props.onCallBack(this.props.keyType, 'res.data.security_token')
		// this.props.onClose();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (!(values.code && values.type)) return;
				const type = this.type(values.type);
				const code = values.code;
				if (values.type === 1) {
					const data = { mail: type, code }
					NetAccount.verifyedEmail(data).then((res) => {
						this.props.onCallBack(this.props.keyType, res.data.security_token)
						this.props.onClose();
					}).catch((res) => {
						this.setState({
							tips: res.msg,
							showTip: false,
						})
					})
				} else {
					const data = { mobile: type, code }
					NetAccount.verifyedSMS(data).then((res) => {
						this.props.onCallBack(this.props.keyType, res.data.security_token)
						this.props.onClose();
					}).catch((res) => {
						this.setState({
							tips: res.msg,
							showTip: false,
						})
					})
				}
			}
		});
	}

	getSMS = () => {
		if (!this.canClick) return;
		const type = this.props.form.getFieldValue('type');
		if (!type) {
			message.error('请选择验证类型');
			return
		}
		this.canClick = false;
		if (type === 1) {
			const mail = this.type(type)
			const types = this.props.types;
			const data = {
				mail,
				type: types
			};
			NetAccount.emailSend(data).then((res) => {
				this.setState({
					showTip: true,
					tips: '验证码已发送至你的邮箱，请到邮箱中查收'
				});
				this.countdownTick();
			}).catch((res) => {
				message.error(res.msg);
			})
		} else {
			const mobile = this.type(type);
			const types = this.props.types;
			const data = {
				mobile,
				type: types
			};
			NetAccount.smsSend(data).then((res) => {
				this.setState({
					showTip: true,
					tips: `验证码已发送至${mobile}，请注意查收`
				});
				this.countdownTick();
			}).catch((res) => {
				message.error(res.msg);
			})
		}
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
					dlgTipTxt: '获取验证码',
					countdown,
				});
				this.canClick = true;
			}
		}, 1000);
	}

	type(tip) {
		const data = this.props.data;
		switch(tip) {
			case 2: return data.mobile
			default: return data.email
		}
	}

	handleSelectChange = () => {
		this.props.form.resetFields();
		this.setState({ tips: '' })
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const data = this.props.data;
		const { showTip, tips, dlgTipTxt } = this.state;
		return <Form onSubmit={this.handlePhone} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<div className={styles.topTip}>为了你的账户安全，请验证身份。验证成功后进行下一步操作。</div>
					<div className={styles.bottomTip}>
						<FormItem className={styles.formItem} wrapperCol={this.formWrapperCol}>
							{getFieldDecorator('type', {
								rules: [{ required: true, message: '请选择验证类型' }]
							})(
								<Select placeholder="验证类型" style={{ width: '100%' }} onChange={this.handleSelectChange}>
									{(this.props.keyType === 'isEmailCheck' || this.props.types === 1 || this.props.keyType === 'isPwdCheck')
										&& <Option value={1}>使用邮箱：{utils.formatEmail(data.email)}</Option>}
									{(this.props.keyType === 'isPhoneCheck' || this.props.keyType === 'isPwdCheck')
										&& data.mobile && <Option value={2}>使用手机：{utils.formatMobile(data.mobile)}</Option>}
								</Select>
							)}
						</FormItem>
						<FormItem wrapperCol={this.formWrapperCol}>
							{getFieldDecorator('code', {
								rules: [{ required: true, message: '请输入验证码' }]
							})(
								<Input type="text" placeholder="6位验证码" style={{ width: '181px',marginRight: '16px' }} />
							)}
							<Button onClick={this.getSMS} style={{ minWidth: 102 }}>{dlgTipTxt}</Button>
						</FormItem>
						{showTip ? <div>{tips}</div> : <div className={styles.tipsColor}>{tips}</div>}
					</div>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary">
							确认
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(AccountCheck);

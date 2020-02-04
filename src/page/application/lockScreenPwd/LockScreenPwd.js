import React, { Component, Fragment } from 'react';
import {
	Form,
	Button,
	message,
	DatePicker,
	Input,
	Icon,
	Alert
} from 'antd';
import classnames from 'classnames';
import Captcha from '@/component/Captcha';
import NetCommon from '@/net/common';
import globalStyles from '@/resource/css/global.module.less';
import styles from '@/resource/css/login.module.less';
import moment from 'moment';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const { RangePicker } = DatePicker;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			showCaptcha: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 12
			},
			wrapperCol: {
				span: 18
			}
		}
	}

	commint = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
                // console.log(localStorage.getItem('username'));
				let account = localStorage.getItem('username').split('@');
				let team_no = '0';
				if (account.length == 2) {
					team_no = account[1];
				}
				const formData = {
					"name": account[0],
					"team_no": team_no,
					"password": values.password,
					"captcha_code": values.captcha_code || ''
				}
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true
		})
		NetCommon.login(data).then((res) => {
            if(res.code == 200){
                message.success('登录成功')
                this.props.okCallBack();
                this.props.onClose();
            }
		}).catch((e) => {
			message.error(e.msg);
			if (e.code == 310) {
				this.props.bindFailed(e);
			}else if(e.code == 304) {
				this.setState({
					isLoading: false,
					showCaptcha: true
				})
				return;
			}else if(e.code == 301){
				this.setState({
					isLoading: false
				})
				return;
			}
			this.props.onClose();
			this.setState({
				isLoading: true
			})
		});
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
							style={{ width: 200, marginRight: 5 }}
						/>
					)}
					<Captcha ref={(instance) => this.elemCaptcha = instance} width="120" height="40" />
				</InputGroup>
			</FormItem>;
		}
	}

	description = () => {
		return <Fragment>
			<p>为了保证系统安全，请输入登录密码</p>
		</Fragment>
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { isLoading } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commint} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<div style={{ marginBottom: '30px' }}>
				<Alert
					message="锁屏登录"
					description={this.description()}
					type="warning"
					showIcon
					closable
				/>
			</div>
			<div className={styles.resetBox}>
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
			</div>
			<div className={globalStyles.footer}>
				{/* <Button
					className={globalStyles.mRight8}
					onClick={this.props.onClose}
				>取消</Button> */}
				<Button htmlType="submit" type="primary" loading={isLoading}>
					登录
						</Button>
			</div>
		</Form>;
	}
}

export default Form.create()(Create);

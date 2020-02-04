import React, { Component } from 'react';
import {
	Form,
	Input,
	Button,
	message
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetAccount from '@/net/account';
import styles from '../../style.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Pwd extends Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	compareToFirstPassword = (rule, value, callback) => {
		const form = this.props.form;
		if (value && value !== form.getFieldValue('newPwd')) {
		  callback('两次密码输入不一致');
		} else {
		  callback();
		}
	}

	handlePwd = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					password: values.newPwd,
					security_token: this.props.token
				}
				NetAccount.putPassword(data).then((res) => {
					message.success('更新成功');
					this.props.onCallBack('isPwdCheck')
				}).catch((res) => {
					message.error(res.msg);
				})
			}
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		return <Form onSubmit={this.handlePwd} className={classnames(styles.alertForm, globalStyles.inputGap)}>
					<FormItem className={styles.formItem}>
						{getFieldDecorator('newPwd', {
							rules: [{ required: true, message: '请输入新密码' }]
						})(
							<Input type="password" placeholder="请输入新密码" autoComplete="new-password" />
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator('repeatPwd', {
							rules: [
								{ required: true, message: '请输入确认密码' },
								{ validator: this.compareToFirstPassword }
							]
						})(
							<Input type="password" placeholder="请输入确认密码" autoComplete="new-password" />
						)}
					</FormItem>
					<FormItem style={{ marginBottom: '0' }}>
						<Button type="primary" htmlType="submit">
							更新密码
						</Button>
					</FormItem>
				</Form>;
	}
}

export default Form.create()(Pwd);

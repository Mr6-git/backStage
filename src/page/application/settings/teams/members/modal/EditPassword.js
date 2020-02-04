import React, { Component } from 'react';
import {
	Form, 
	Input,
	Button,
	message,
} from 'antd';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Password extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 7
			},
			wrapperCol: {
				span: 15
			}
		}
	}
	
	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					password: values.newPwd
				}
				this.postData(data)
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetSystem.editMemberPwd(this.props.id, data).then((res) => {
			message.success('修改成功');
			this.props.onClose();
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	compareToFirstPassword = (rule, value, callback) => {
		const form = this.props.form;
		if (value && value !== form.getFieldValue('newPwd')) {
		  callback('两次密码输入不一致');
		} else {
		  callback();
		}
	}

	render() {
		const state = this.state;
		const { getFieldDecorator } = this.props.form;
		return <Form
					onSubmit={this.commit} 
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
				>
					<FormItem label="输入新密码" {...this.formItemLayout}>
						{getFieldDecorator('newPwd', {
							rules: [{ required: true, message: '请输入新密码' }]
						})(
							<Input type="password" placeholder="请输入新密码" autoComplete="new-password" />
						)}
					</FormItem>
					<FormItem label="再次确认密码" {...this.formItemLayout}>
						{getFieldDecorator('repeatPwd', {
							rules: [
								{ required: true, message: '请输入确认密码' },
								{ validator: this.compareToFirstPassword }
							]
						})(
							<Input type="password" placeholder="请输入确认密码" autoComplete="new-password" />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Password);

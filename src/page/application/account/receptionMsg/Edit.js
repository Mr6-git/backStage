import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Button,
	message,
	Alert
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetSystem from '@/net/system';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
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
				let formData = {
					robot_name: values.robot_name,
					access_token: values.access_token
				}
				this.edit(formData);
			}
		});
	}

	edit = (data) => {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetSystem.editDingRobot(this.props.data.id, data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('修改成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	description = () => {
		return <Fragment>
					在钉钉群设置/群机器人中添加并获取机器人信息 <a href="https://ding-doc.dingtalk.com/doc#/serverapi3/iydd5h?spm=5176.2020520130.0.0.3c41697bv966Lc">如何获取Access Token</a>
				</Fragment>
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;
		const formItemLayout = this.formItemLayout;
		return <Fragment>
					<Alert
						message="帮助提示"
						description={this.description()}
						type="info"
						showIcon
						style={{ marginBottom: '20px' }}
					/>
					<Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
						<FormItem label="名称" {...formItemLayout}>
							{getFieldDecorator('robot_name', {
								rules: [
									{ required: true, message: '请输入钉钉机器人名称' }
								],
								initialValue: this.props.data.robot_name
							})(
								<Input placeholder="请输入" />
							)}
						</FormItem>
						<FormItem label="Access Token" {...formItemLayout}>
							{getFieldDecorator('access_token', {
								rules: [
									{ required: true, message: '请输入Access Token' }
								],
								initialValue: this.props.data.access_token
							})(
								<Input placeholder="请输入" />
							)}
						</FormItem>
						<div className={globalStyles.footer}>
							<Button
								className={globalStyles.mRight8}
								onClick={this.props.onClose}
							>取消</Button>
							<Button htmlType="submit" type="primary" loading={loading}>
								确定
								</Button>
						</div>
					</Form>
				</Fragment>
	}
}

export default Form.create()(Edit);

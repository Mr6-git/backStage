import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Alert,
	Button,
	message,
} from 'antd';
import utils from '@/utils';
import classnames from 'classnames';
import NetAccount from '@/net/account';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;

class Add extends Component {
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
					ip_address: values.ip_address,
					desc: values.desc ? values.desc : ''
				}
				this.add(formData);
			}
		});
	}

	add = (data) => {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetAccount.createIpBlack(data).then((res) => {
			this.props.onClose();
			this.props.onOK();
			message.success('操作成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			})
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading } = this.state;
		const formItemLayout = this.formItemLayout;
		let { type, data } = this.props,
			defaultValue,
			disabled;
		if (type == '0') {
			defaultValue = data.ip_address;
			disabled = true;
		} else {
			defaultValue = '';
			disabled = false;
		}
		return <Fragment>
					<Alert
						message="单个IP地址段，如192.168.1.1；一个地址段，如192.168.1.0/24"
						style={{ marginBottom: 20 }}
						type="info"
						showIcon
					/>
					<Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
						<FormItem label="地址/地址段" {...formItemLayout}>
							{getFieldDecorator('ip_address', {
								rules: [
									{ required: true, message: '请输入地址/地址段' }

								],
								initialValue: defaultValue
							})(
								<Input placeholder="请输入" disabled={disabled} />
							)}
						</FormItem>
						<FormItem label="备注" {...formItemLayout}>
							{getFieldDecorator('desc', {})(
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

export default Form.create()(Add);

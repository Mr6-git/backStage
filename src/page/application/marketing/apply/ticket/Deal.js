import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import {
	Form,
	Radio,
	Input,
	Button,
	message,
} from 'antd';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;

class Deal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					desc: values.desc,
					ids: this.props.data._id
				};
				if (this.state.isLoading) return;
				this.setState({
					isLoading: true
				});
				switch (values.action) {
					case 1: this.passData(data); break;
					case 2: this.refuseData(data); break;
				}
			}
		});
	}

	passData(json) {
		NetMarketing.auditPass(json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	refuseData(json) {
		NetMarketing.auditRefuse(json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	render() {
		const state = this.state;
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = this.props.form;
		let action = 1;
		let reason = this.props.data.desc;

		return <Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="操作">
						{getFieldDecorator('action', {
							rules: [{
								required: true,
							}],
							initialValue: action,
						})(
							<RadioGroup>
								<Radio value={1}>发货</Radio>
								<Radio value={2}>作废</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="描述">
						{getFieldDecorator('desc', {
							rules: [{
								required: true,
								message: '请输入',
							}],
							initialValue: reason
						})(
							<TextArea placeholder="请输入" rows={4} />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={state.isLoading}>确定</Button>
					</div>
				</Form>
	}
}

export default Form.create()(Deal)

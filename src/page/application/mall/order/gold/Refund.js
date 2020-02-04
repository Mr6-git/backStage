import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import {
	Input,
	Form,
	Button,
	message,
} from 'antd';
import NetMall from '@/net/mall';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;

class Refund extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					reason: values.desc
				};
				if (this.state.isLoading) return;
				this.setState({
					isLoading: true
				})
				this.passData(data);
			}
		});
	}

	passData(json) {
		NetMall.goldAgreeRefund(this.props.data.order_number, json).then((res) => {
			message.success('操作成功');
			this.props.onChange();
			this.props.onClose()
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				isLoading: false
			})
		});
	}

	render() {
		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 16 },
		};
		const { getFieldDecorator } = this.props.form;
		return <Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="退款理由">
						{getFieldDecorator('desc', {
							rules: [{
								required: true,
								message: '请输入',
							}],
						})(
							<TextArea placeholder="请输入" rows={4} />
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
	}
}

export default Form.create()(Refund)

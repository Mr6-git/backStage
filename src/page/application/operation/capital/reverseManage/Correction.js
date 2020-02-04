import React, { Component } from 'react';
import {
	Form,
	Input,
	Alert,
	Radio,
	Button,
	message,
	Checkbox,
} from 'antd';
import classnames from 'classnames';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const RadioGroup = Radio.Group;
const { TextArea } = Input;
const FormItem = Form.Item;

class Correction extends Component {
	state = {
		loading: false,
	};
	formItemLayout = {
		wrapperCol: { span: 18 },
		labelCol: { span: 5 },
	};

	handleSearch = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!(values.customer_id && values.price)) return;
			const data = {
				customer_id: values.customer_id,
				price: Number((Number(values.price) * 100).toFixed(0)),
				trade_type: values.trade_type,
				desc: values.desc,
				is_transfer_bounty: 0,
			};
			this.reverseManage(data);
		});
	}

	reverseManage(filterData = {}) {
		if (this.state.loading) return;
		this.setState({
			loading: true,
		});
		NetOperation.reverseManage(filterData).then((res) => {
			message.success('提交成功');
			this.props.okCallback();
			this.props.onClose();
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false,
			});
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;

		return (
			<div className={globalStyles.formItemGap}>
				<Alert
					message="该功能仅限充值虚拟币使用"
					type="warning"
					showIcon
				/>
				<Form
					className={classnames(globalStyles.inputGap, globalStyles.modalForm)}
					onSubmit={this.handleSearch}
				>
					<FormItem label="冲正类型" {...this.formItemLayout}>
						{getFieldDecorator('trade_type', {
								initialValue: 5,
						})(
							<RadioGroup name="correctType">
								<Radio value={5}>红冲（减少资金）</Radio>
								<Radio value={6}>蓝补（增加资金）</Radio>
							</RadioGroup>
						)}
					</FormItem>
					<FormItem label="客户ID" {...this.formItemLayout}>
						{getFieldDecorator('customer_id', {
							rules: [{ required: true, message: '请输入客户ID' }]
						})(
							<Input type="text" placeholder="请输入客户ID" />
						)}
					</FormItem>
					<FormItem label="金额" {...this.formItemLayout}>
						{getFieldDecorator('price', {
							rules: [{ required: true, message: '请输入金额' }]
						})(
							<Input type="number" max={10000} addonBefore="￥" placeholder="请输入金额" />
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							rules: [{ min: 5, message: '不得少于五个字符' }],
						})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							></TextArea>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary">
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Correction);

import React, { Component } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	DatePicker,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import utils from '@/utils';
import moment from 'moment';
import NetMarketing from '@/net/marketing';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			amount: 0,
			issued: 0
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					title: values.title,
					amount: Number(values.amount) * 100,
					issued: Number(values.issued),
					receive_expire_day: Number(values.receive_expire_day),
					expire_time: values.expire_time ? values.expire_time.unix() : 0,
					desc: values.desc || ''
				}
				this.postData(data)
			}
		});
	}

	postData(json) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetMarketing.createRedEnvelop(json).then((res) => {
			message.success('创建成功');
			this.props.okCallback(true);
			this.props.onClose();
		}).catch((res) => {
			message.error(res.msg);
			this.setState({
				isLoading: false,
			});
		});
	}

	handleAmountChange = value => {
		this.setState({ amount: value });
	}

	handleIssuedChange = value => {
		this.setState({ issued: value });
	}

	render() {
		const { form, onClose } = this.props;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="红包名称" {...formItemLayout}>
						{getFieldDecorator('title', {
							rules: [
								{ required: true, message: '请输入红包名称' }
							],
						})(
							<Input type="text" placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="面额" {...formItemLayout}>
						{getFieldDecorator('amount', {
							rules: [
								{ required: true, message: '请输入面额' }
							],
						})(
							<InputNumber type="text" min={1} maxLength={5} placeholder="请输入" style={{ width: '150px' }} onChange={this.handleAmountChange} />
						)}
					</FormItem>
					<FormItem label="发行数量" {...formItemLayout}>
						{getFieldDecorator('issued', {
							rules: [
								{ required: true, message: '请输入发行数量' },
							],
						})(
							<InputNumber type="text" placeholder="请输入" min={1} maxLength={9} style={{ width: '150px' }} onChange={this.handleIssuedChange} />
						)} 个，总费用{utils.formatMoney(this.state.amount * this.state.issued)}
					</FormItem>
					<FormItem label="有效时间" {...formItemLayout}>
						领取之日起 {getFieldDecorator('receive_expire_day', {})(
							<InputNumber type="text" min={1} maxLength={3} placeholder="请输入" style={{ width: '76px' }} />
						)} 天内有效
					</FormItem>
					<FormItem label="到期时间" {...this.formItemLayout} style={{ display: 'none' }}>
						{getFieldDecorator('expire_time', {})(
							<DatePicker style={{ width: '150px' }} format="YYYY-MM-DD" showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
						)}
					</FormItem>
					<FormItem label="描述" {...formItemLayout}>
						{getFieldDecorator('desc', {})(
							<TextArea
								placeholder="请输入描述"
								rows={4}
							/>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button
							className={globalStyles.mRight8}
							onClick={onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Create);

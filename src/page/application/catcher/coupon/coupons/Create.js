import React, { Component } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	DatePicker,
} from 'antd';
import moment from 'moment';
import classnames from 'classnames';
import NetWawaji from '@/net/wawaji'
import styles from '../../styles.module.less';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			uploadQrCode: '',
			qrCodeFile: {},
			previewImage: '',
			previewBackVisible: false,
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
					price: Number(values.price * 100),
					number: Number(values.number),
					type: values.type,
					due_time: values.due_time != undefined ? values.due_time.unix() : 0,
					desc: values.desc ? values.desc : ''
				}
				this.postData(formData);
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			loading: true
		});
		NetWawaji.addCoupon(data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('创建成功');
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
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="面额" {...formItemLayout}>
						{getFieldDecorator('price', {
							rules: [
								{ required: true, message: '请输入面额：' }
							],
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="发行数量" {...formItemLayout}>
						{getFieldDecorator('number', {
							rules: [
								{ required: true, message: '请输入发行数量：' }
							],
						})(
							<Input type="number" placeholder="请输入" />
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="券类型">
						{getFieldDecorator('type', {
							rules: [{ required: true, message: '请选择券类型' }],
						})(
							<Select placeholder="请选择">
								<Option value={0}>纸质券</Option>
								<Option value={1}>电子券</Option>
							</Select>
						)}
					</FormItem>
					<FormItem label="到期时间" {...this.formItemLayout}>
						{getFieldDecorator('due_time', {
						})(
							<DatePicker format="YYYY-MM-DD" showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }} />
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
							onClick={this.props.onClose}
						>取消</Button>
						<Button htmlType="submit" type="primary" loading={loading}>
							确定
						</Button>
					</div>
				</Form>;
	}
}

export default Form.create()(Create);

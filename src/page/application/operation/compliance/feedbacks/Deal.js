import React, { Component } from 'react';
import {
	Icon,
	Form,
	Input,
	Select,
	Button,
	message,
	TreeSelect,
	DatePicker,
	InputNumber,
} from 'antd';
import classnames from 'classnames';
import utils from '@/utils';
import moment from 'moment';
import NetOperation from '@/net/operation';
import globalStyles from '@/resource/css/global.module.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class Edit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			groupList: [
				{
					key: 1,
					value: '处理中'
				}, {
					key: 2,
					value: '已处理'
				}
			]
		}
		this.formItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 16
			}
		}
		this.numItemLayout = {
			labelCol: {
				span: 6
			},
			wrapperCol: {
				span: 6
			}
		}
	}

	commit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					desc: values.desc,
					status: values.status,
					ids: this.props.ids
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
		NetOperation.dealFeedbacks(json).then((res) => {
			this.props.okCallback();
			this.props.onClose()
			message.success('处理成功');
		}).catch((err) => {
			if (err.msg || process.env.NODE_ENV != 'production') {
				message.error(err.msg);
			}
		});
	}

	render() {
		const props = this.props;
		const { form, onClose } = props;
		const { getFieldDecorator } = form;
		const formItemLayout = this.formItemLayout;
		const numItemLayout = this.numItemLayout;
		const { groupList } = this.state;
		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
			<FormItem label="处理描述" {...formItemLayout}>
				{getFieldDecorator('desc', {
					initialValue: props.desc
				})(
					<TextArea
						placeholder="请输入描述"
						rows={4}
					/>
				)}
			</FormItem>
			<FormItem label="处理状态" {...numItemLayout}>
				{getFieldDecorator('status', {
					rules: [{ required: true, message: '请选择处理状态' }],
				})(
					<Select placeholder="请选择">
						{groupList.map(item => (
							<Option value={item.key} key={item.key}>{item.value}</Option>
						))}
					</Select>
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

export default Form.create()(Edit);

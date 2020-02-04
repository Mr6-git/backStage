import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	Select,
	Button,
	message,
	Checkbox,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import NetMedia from '@/net/media';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					name: values.name,
					order: values.order || 0,
					status: values.status ? 1 : 0,
					desc: '',
					assort: values.assort.toString()
				}
				this.postData(data);
			}
		});
	}

	postData(data) {
		if (this.state.isLoading) return;
		this.setState({
			isLoading: true,
		});
		NetMedia.createArticleCategory(data).then((res) => {
			this.props.onClose();
			this.props.onChange();
			message.success('创建成功');
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false,
			});
		});
	}

	render() {
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 15 },
		};
		const { form, onClose } = this.props;
		const { getFieldDecorator } = form;
		const classifyList = [
			{
				_id: 0,
				name: 'APP资讯'
			}, {
				_id: 2,
				name: '新闻报道'
			}, {
				_id: 3,
				name: '帮助&客服'
			}, {
				_id: 1,
				name: '其他'
			}
		]
		return <Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="分类名称">
						{getFieldDecorator('name', {
							rules: [{ required: true, message: '请输入分类名称' }]
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="类目">
						{getFieldDecorator('assort', {
							rules: [{ required: true, message: '请选择类目' }],
						})(
							<Select placeholder="请选择类目">
								{classifyList.map(item => (
									<Option value={item._id} key={item._id}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="排序">
						{getFieldDecorator('order', {
							rules: [{ required: true, message: '请输入排序' }]
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
								maxLength={4}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="设置">
						{getFieldDecorator('status', {
							valuePropName: 'checked',
							initialValue: true,
						})(
							<Checkbox>启用</Checkbox>
						)}
					</FormItem>
					<div className={globalStyles.footer}>
						<Button className={globalStyles.mRight8} onClick={onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
	}
}

export default Form.create()(Create)

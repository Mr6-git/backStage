import React, { Component, Fragment } from 'react';
import {
	Form,
	Input,
	InputNumber,
	Button,
	message,
	Modal,
	Select,
} from 'antd';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';
import NetSystem from '@/net/system';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			groupList: [
				{
					val: 'default',
					name: '默认'
				},{
					val: 'apple',
					name: '苹果应用市场'
				},{
					val: 'yingyongbao',
					name: '应用宝'
				},{
					val: 'huawei',
					name: '华为应用市场'
				},,{
					val: 'xiaomi',
					name: '小米应用商店'
				},{
					val: 'oppos',
					name: 'OPPO软件商店'
				},{
					val: 'vivo',
					name: 'vivo应用商店'
				},{
					val: 'safe360',
					name: '360手机助手'
				}
			]
		};
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
				let formData = {
					platform: values.platform,
					version: values.version,
					order: values.order ? Number(values.order) : '',
					desc: values.desc
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
		NetSystem.addAppLog(data).then((res) => {
			this.props.onClose();
			this.props.okCallback();
			message.success('新增成功');
		}).catch((e) => {
			message.error(e.msg);
			this.setState({
				loading: false
			});
		});
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { loading , groupList } = this.state;
		const formItemLayout = this.formItemLayout;

		return <Form onSubmit={this.commit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem label="市场" {...formItemLayout}>
						{getFieldDecorator('platform', {
							rules: [
								{ required: true, message: '请选择市场' }
							],
						})(
							<Select placeholder="请选择">
								{groupList.map(item => (
									<Option value={item.val} key={item.val}>{item.name}</Option>
								))}
							</Select>
						)}
					</FormItem>
					<FormItem label="版本号" {...formItemLayout}>
						{getFieldDecorator('version', {
							rules: [
								{ required: true, message: '请输入版本号' }
							],
						})(
							<Input placeholder="请输入" />
						)}
					</FormItem>
					<FormItem label="排序" {...formItemLayout}>
						{getFieldDecorator('order', {
							rules: [
								{ required: true, message: '请输入排序' }
							],
							initialValue: 1
						})(
							<InputNumber placeholder="请输入" />
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

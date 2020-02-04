import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
	Form,
	Input,
	Button,
	Select,
	message,
	Checkbox,
	InputNumber,
} from 'antd';
import utils from '@/utils';
import NetSystem from '@/net/system';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { Option } = Select;
const FormItem = Form.Item;
const { TextArea } = Input;

class Create extends Component {
	static propTypes = {
		data: PropTypes.object
	}
	static defaultProps = {
		data: {}
	}
	constructor(props) {
		super(props);
		this.state = {
			_key: '',
		}
	}

	onSubmit = (e) => {
		e && e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const data = {
					key: values.key,
					title: values.title,
					width: values.width,
					height: values.height,
					rotation_time: values.rotation_time,
					desc: values.desc,
					status: values.status ? 1 : 0,
					app_id: localStorage.getItem('appId')
				};
				this.postData(data)
			}
		});
	}

	postData(data) {
		if (this.state.loading) return;
		this.setState({
			isLoading: true
		});
		NetSystem.createPosition(data).then((res) => {
			message.success('创建成功');
			this.props.okCallback();
			this.props.onClose()
		}).catch((err) => {
			if (err.msg) {
				message.error(err.msg);
			}
			this.setState({
				isLoading: false
			})
		});
	}

	generate = () => {
		const _key = utils.generateUUID();
		this.props.form.setFieldsValue({
			key: _key,
		});
	}

	render() {
		const { data } = this.props;
		const formItemLayout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 17 },
		};
		const { getFieldDecorator } = this.props.form;
		const { _key } = this.state;
		return (
			<Fragment>
				<Form onSubmit={this.onSubmit} className={classnames(globalStyles.inputGap, globalStyles.modalForm)}>
					<FormItem {...formItemLayout} label="标识">
						{getFieldDecorator('key', {
							rules: [{ required: true, message: '请输入键标识' }],
						})(
							<Input
								type="text"
								placeholder="请输入"
								autoFocus={true}
								style={{ width: '80%' }}
							/>
						)}
						<Button
							style={{ marginLeft: '10px' }}
							onClick={this.generate}
						>生成</Button>
					</FormItem>
					<FormItem {...formItemLayout} label="广告名称">
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入广告名称' }]
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="宽度(px)">
						{getFieldDecorator('width', {
							rules: [{ required: true, message: '请输入宽度' }]
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="高度(px)">
						{getFieldDecorator('height', {
							rules: [{ required: true, message: '请输入高度' }]
						})(
							<InputNumber
								min={1}
								placeholder="请输入"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="轮播时间">
						{getFieldDecorator('rotation_time', {
							rules: [{ required: true, message: '请选择轮播时间' }],
							initialValue: 1
						})(
							<Select placeholder="请选择">
								<Option value={1}>1秒</Option>
								<Option value={3}>3秒</Option>
								<Option value={5}>5秒</Option>
								<Option value={8}>8秒</Option>
								<Option value={10}>10秒</Option>
								<Option value={15}>15秒</Option>
							</Select>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="描述">
						{getFieldDecorator('desc', {
							rules: [{ required: true, message: '请输入描述' }]
						})(
							<TextArea
								placeholder="请输入"
								rows={4}
							></TextArea>
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
						<Button className={globalStyles.mRight8} onClick={this.props.onClose}>取消</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>确定</Button>
					</div>
				</Form>
			</Fragment>
		);
	}
}

export default Form.create()(Create)

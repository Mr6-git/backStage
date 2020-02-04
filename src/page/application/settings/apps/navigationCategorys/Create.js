import React, { Component } from 'react';
import {
	Form,
	Spin,
	Input,
	Button,
	message,
	InputNumber,
} from 'antd';
import utils from '@/utils'
import NetSystem from '@/net/system';
import classnames from 'classnames';
import globalStyles from '@/resource/css/global.module.less';

const { TextArea } = Input;
const FormItem = Form.Item;

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
			_key: '',
			loading: false,
		};
		this.formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 16
			}
		}
	}

	componentWillMount() {}

	handleEdit = (e) => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				let data = {
					app_id: localStorage.getItem('appId'),
					key: values.key,
					title: values.title,
					desc: values.desc ? values.desc : '',
					order: values.order,
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
		NetSystem.createCategory(data).then((res) => {
			data._id = res.data._id;
			this.props.onClose();
			this.props.okCallback(data);
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

	generate = () => {
		const _key = utils.generateUUID();
		this.props.form.setFieldsValue({
			key: _key,
		});
	}

	render() {
		const { _key, loading } = this.state;
		const { getFieldDecorator } = this.props.form;

		if (loading) return <div className={globalStyles.flexCenter}><Spin /></div>;

		return (
			<div
				className={classnames(globalStyles.formItemGap)}
			>
				<Form
					className="ant-advanced-search-form"
					onSubmit={this.handleEdit}
					style={{ paddingBottom: '40px' }}
				>
					<FormItem label="标识" {...this.formItemLayout}>
						{getFieldDecorator('key', {
							rules: [{ required: true, message: '请输入键标识' }],
							initialValue: _key
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
					<FormItem label="名称" {...this.formItemLayout}>
						{getFieldDecorator('title', {
							rules: [{ required: true, message: '请输入键值' }]
						})(
							<Input
								type="text"
								maxLength={20}
								placeholder="请输入"
								autoFocus={true}
							/>
						)}
					</FormItem>
					<FormItem label="描述" {...this.formItemLayout}>
						{getFieldDecorator('desc', {
							})(
								<TextArea
									placeholder="请输入至少五个字符"
									rows={4}
									minLength={5}
									maxLength={100}
								/>
							)}
					</FormItem>
					<FormItem {...this.formItemLayout} label="排序">
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
					<div className={globalStyles.drawerBottom}>
						<Button
							className={globalStyles.mRight8}
							onClick={this.props.onClose}
						>
							取消
						</Button>
						<Button htmlType="submit" type="primary" loading={this.state.isLoading}>
							确定
						</Button>
					</div>
				</Form>
			</div>
		);
	}
}

export default Form.create()(Create);
